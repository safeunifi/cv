import SwiftUI
import AVFoundation
import Combine

/// ViewModel coordinating camera capture, pose detection, and recording
@MainActor
final class CaptureViewModel: ObservableObject {
    @Published var cameraAngle: CameraAngle = .downTheLine
    @Published var clubType: ClubType = .sevenIron
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var showAngleGuide = true
    @Published var isSlowMotion = false
    @Published var showReview = false
    @Published var recordedVideoURL: URL?
    @Published var poseOverlayPoints: [CGPoint] = []
    @Published var poseConnections: [(CGPoint, CGPoint)] = []
    @Published var isAnalyzing = false
    @Published var analysisResult: SwingAnalysis?
    @Published var error: String?
    @Published var cameraPermissionGranted = false

    let cameraService = CameraService()
    let poseService = PoseDetectionService()
    private let analyzer = SwingAnalyzer()
    private var recordingTimer: Timer?
    private var cancellables = Set<AnyCancellable>()

    init() {
        setupBindings()
    }

    private func setupBindings() {
        cameraService.$recordedVideoURL
            .compactMap { $0 }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] url in
                self?.recordedVideoURL = url
                self?.showReview = true
            }
            .store(in: &cancellables)

        cameraService.$error
            .compactMap { $0?.localizedDescription }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] errorMsg in
                self?.error = errorMsg
            }
            .store(in: &cancellables)

        // Wire up pose detection to camera frames
        cameraService.onFrameCaptured = { [weak self] pixelBuffer, timestamp in
            self?.poseService.detectPose(in: pixelBuffer, timestamp: timestamp)
        }

        // Update pose overlay when new pose data comes in
        poseService.$currentPose
            .receive(on: DispatchQueue.main)
            .sink { [weak self] joints in
                self?.updatePoseOverlay(joints: joints)
            }
            .store(in: &cancellables)
    }

    // MARK: - Camera Control

    func setupCamera() async {
        cameraPermissionGranted = await cameraService.checkPermissions()
        if cameraPermissionGranted {
            cameraService.configureSession()
            cameraService.startSession()
        }
    }

    func teardownCamera() {
        cameraService.stopSession()
    }

    // MARK: - Recording

    func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }

    private func startRecording() {
        poseService.resetFrames()
        recordingDuration = 0
        cameraService.startRecording()
        isRecording = true

        recordingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.recordingDuration += 0.1
            }
        }
    }

    private func stopRecording() {
        cameraService.stopRecording()
        isRecording = false
        recordingTimer?.invalidate()
        recordingTimer = nil
    }

    // MARK: - Slow Motion

    func toggleSlowMotion() {
        isSlowMotion.toggle()
        cameraService.setSlowMotionMode(enabled: isSlowMotion)
    }

    // MARK: - Analysis

    func analyzeRecording() async {
        guard let url = recordedVideoURL else { return }

        isAnalyzing = true
        do {
            let frames = try await poseService.analyzeVideo(at: url)
            let analysis = analyzer.analyze(frames: frames, cameraAngle: cameraAngle)
            self.analysisResult = analysis
        } catch {
            self.error = "Analysis failed: \(error.localizedDescription)"
        }
        isAnalyzing = false
    }

    // MARK: - Pose Overlay

    private func updatePoseOverlay(joints: [VNHumanBodyPoseObservation.JointName: CGPoint]) {
        guard !joints.isEmpty else {
            poseOverlayPoints = []
            poseConnections = []
            return
        }

        poseOverlayPoints = joints.values.map { $0 }

        // Define skeleton connections
        let connectionPairs: [(VNHumanBodyPoseObservation.JointName, VNHumanBodyPoseObservation.JointName)] = [
            (.neck, .leftShoulder),
            (.neck, .rightShoulder),
            (.leftShoulder, .leftElbow),
            (.leftElbow, .leftWrist),
            (.rightShoulder, .rightElbow),
            (.rightElbow, .rightWrist),
            (.neck, .root),
            (.root, .leftHip),
            (.root, .rightHip),
            (.leftHip, .leftKnee),
            (.leftKnee, .leftAnkle),
            (.rightHip, .rightKnee),
            (.rightKnee, .rightAnkle),
        ]

        poseConnections = connectionPairs.compactMap { pair in
            guard let p1 = joints[pair.0], let p2 = joints[pair.1] else { return nil }
            return (p1, p2)
        }
    }

    // MARK: - Reset

    func resetForNewCapture() {
        recordedVideoURL = nil
        analysisResult = nil
        showReview = false
        isAnalyzing = false
        recordingDuration = 0
        poseService.resetFrames()
    }

    var formattedDuration: String {
        let minutes = Int(recordingDuration) / 60
        let seconds = Int(recordingDuration) % 60
        let tenths = Int(recordingDuration * 10) % 10
        return String(format: "%d:%02d.%d", minutes, seconds, tenths)
    }
}
