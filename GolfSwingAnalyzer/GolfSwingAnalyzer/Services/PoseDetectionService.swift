import Vision
import AVFoundation
import Combine

/// Detects human body pose from video frames using Apple Vision framework
final class PoseDetectionService: ObservableObject {
    @Published var currentPose: [VNHumanBodyPoseObservation.JointName: CGPoint] = [:]
    @Published var poseConfidence: Float = 0
    @Published var isDetectingPose = false

    private var poseFrames: [PoseFrame] = []
    private let requestQueue = DispatchQueue(label: "pose.detection.queue", qos: .userInteractive)

    /// All joints we track for golf swing analysis
    static let trackedJoints: [VNHumanBodyPoseObservation.JointName] = [
        .nose, .neck,
        .leftShoulder, .rightShoulder,
        .leftElbow, .rightElbow,
        .leftWrist, .rightWrist,
        .root, // Hip center
        .leftHip, .rightHip,
        .leftKnee, .rightKnee,
        .leftAnkle, .rightAnkle,
    ]

    // MARK: - Real-time Detection

    /// Process a single frame for pose detection
    func detectPose(in pixelBuffer: CVPixelBuffer, timestamp: CMTime) {
        let request = VNDetectHumanBodyPoseRequest { [weak self] request, error in
            guard let self,
                  error == nil,
                  let observation = request.results?.first as? VNHumanBodyPoseObservation else {
                return
            }

            let joints = self.extractJointPositions(from: observation)
            let frame = PoseFrame(
                timestamp: CMTimeGetSeconds(timestamp),
                joints: joints
            )

            self.poseFrames.append(frame)

            let displayJoints = joints.reduce(into: [VNHumanBodyPoseObservation.JointName: CGPoint]()) { result, pair in
                result[pair.key] = CGPoint(x: CGFloat(pair.value.x), y: CGFloat(pair.value.y))
            }

            DispatchQueue.main.async {
                self.currentPose = displayJoints
                self.poseConfidence = observation.confidence
                self.isDetectingPose = true
            }
        }

        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
        requestQueue.async {
            try? handler.perform([request])
        }
    }

    // MARK: - Video Analysis

    /// Analyze an entire recorded video for pose data
    func analyzeVideo(at url: URL) async throws -> [PoseFrame] {
        let asset = AVAsset(url: url)
        let reader = try AVAssetReader(asset: asset)

        guard let videoTrack = try await asset.loadTracks(withMediaType: .video).first else {
            throw PoseError.noVideoTrack
        }

        let outputSettings: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]

        let trackOutput = AVAssetReaderTrackOutput(track: videoTrack, outputSettings: outputSettings)
        reader.add(trackOutput)
        reader.startReading()

        var frames: [PoseFrame] = []
        let duration = try await asset.load(.duration)
        let totalSeconds = CMTimeGetSeconds(duration)

        // Sample at key intervals for efficiency (every ~33ms = ~30fps analysis)
        var frameCount = 0
        while reader.status == .reading {
            guard let sampleBuffer = trackOutput.copyNextSampleBuffer() else { break }

            // Analyze every other frame for performance
            frameCount += 1
            guard frameCount % 2 == 0 else { continue }

            guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { continue }
            let timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)

            let request = VNDetectHumanBodyPoseRequest()
            let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
            try handler.perform([request])

            if let observation = request.results?.first as? VNHumanBodyPoseObservation {
                let joints = extractJointPositions(from: observation)
                let frame = PoseFrame(
                    timestamp: CMTimeGetSeconds(timestamp),
                    joints: joints
                )
                frames.append(frame)
            }
        }

        return frames
    }

    // MARK: - Joint Extraction

    private func extractJointPositions(
        from observation: VNHumanBodyPoseObservation
    ) -> [VNHumanBodyPoseObservation.JointName: PoseFrame.JointPosition] {
        var joints: [VNHumanBodyPoseObservation.JointName: PoseFrame.JointPosition] = [:]

        for jointName in Self.trackedJoints {
            if let point = try? observation.recognizedPoint(jointName),
               point.confidence > 0.3 {
                joints[jointName] = PoseFrame.JointPosition(
                    x: point.location.x,
                    y: point.location.y,
                    confidence: point.confidence
                )
            }
        }

        return joints
    }

    // MARK: - State Management

    func resetFrames() {
        poseFrames = []
        DispatchQueue.main.async {
            self.currentPose = [:]
            self.poseConfidence = 0
            self.isDetectingPose = false
        }
    }

    func getCollectedFrames() -> [PoseFrame] {
        return poseFrames
    }

    enum PoseError: LocalizedError {
        case noVideoTrack
        case analysisInterrupted

        var errorDescription: String? {
            switch self {
            case .noVideoTrack: return "No video track found in recording"
            case .analysisInterrupted: return "Pose analysis was interrupted"
            }
        }
    }
}
