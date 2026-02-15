import AVFoundation
import UIKit
import Combine

/// Manages camera capture session for recording golf swings
final class CameraService: NSObject, ObservableObject {
    @Published var isSessionRunning = false
    @Published var isRecording = false
    @Published var recordedVideoURL: URL?
    @Published var error: CameraError?
    @Published var currentFrame: CVPixelBuffer?

    let session = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "camera.session.queue")
    private let videoOutput = AVCaptureVideoDataOutput()
    private var movieFileOutput = AVCaptureMovieFileOutput()
    private var videoDeviceInput: AVCaptureDeviceInput?

    var onFrameCaptured: ((CVPixelBuffer, CMTime) -> Void)?

    enum CameraError: LocalizedError {
        case cameraUnavailable
        case cannotAddInput
        case cannotAddOutput
        case permissionDenied
        case recordingFailed(String)

        var errorDescription: String? {
            switch self {
            case .cameraUnavailable: return "Camera is not available"
            case .cannotAddInput: return "Cannot configure camera input"
            case .cannotAddOutput: return "Cannot configure camera output"
            case .permissionDenied: return "Camera permission denied. Please enable in Settings."
            case .recordingFailed(let msg): return "Recording failed: \(msg)"
            }
        }
    }

    // MARK: - Setup

    func checkPermissions() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .video)
        default:
            await MainActor.run { self.error = .permissionDenied }
            return false
        }
    }

    func configureSession() {
        sessionQueue.async { [weak self] in
            guard let self else { return }
            self.session.beginConfiguration()
            self.session.sessionPreset = .high

            // Video input
            guard let videoDevice = AVCaptureDevice.default(
                .builtInWideAngleCamera,
                for: .video,
                position: .back
            ) else {
                DispatchQueue.main.async { self.error = .cameraUnavailable }
                self.session.commitConfiguration()
                return
            }

            do {
                let videoInput = try AVCaptureDeviceInput(device: videoDevice)
                if self.session.canAddInput(videoInput) {
                    self.session.addInput(videoInput)
                    self.videoDeviceInput = videoInput
                } else {
                    DispatchQueue.main.async { self.error = .cannotAddInput }
                    self.session.commitConfiguration()
                    return
                }
            } catch {
                DispatchQueue.main.async { self.error = .cannotAddInput }
                self.session.commitConfiguration()
                return
            }

            // Audio input
            if let audioDevice = AVCaptureDevice.default(for: .audio),
               let audioInput = try? AVCaptureDeviceInput(device: audioDevice),
               self.session.canAddInput(audioInput) {
                self.session.addInput(audioInput)
            }

            // Video data output (for real-time pose detection)
            self.videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "video.frame.queue"))
            self.videoOutput.alwaysDiscardsLateVideoFrames = true
            if self.session.canAddOutput(self.videoOutput) {
                self.session.addOutput(self.videoOutput)
            }

            // Movie file output (for recording)
            if self.session.canAddOutput(self.movieFileOutput) {
                self.session.addOutput(self.movieFileOutput)
                if let connection = self.movieFileOutput.connection(with: .video) {
                    connection.preferredVideoStabilizationMode = .auto
                }
            } else {
                DispatchQueue.main.async { self.error = .cannotAddOutput }
                self.session.commitConfiguration()
                return
            }

            // Configure frame rate for smooth capture
            do {
                try videoDevice.lockForConfiguration()
                videoDevice.activeVideoMinFrameDuration = CMTime(value: 1, timescale: 60)
                videoDevice.activeVideoMaxFrameDuration = CMTime(value: 1, timescale: 60)
                videoDevice.unlockForConfiguration()
            } catch {
                // Default frame rate is fine
            }

            self.session.commitConfiguration()
        }
    }

    // MARK: - Session Control

    func startSession() {
        sessionQueue.async { [weak self] in
            guard let self, !self.session.isRunning else { return }
            self.session.startRunning()
            DispatchQueue.main.async {
                self.isSessionRunning = self.session.isRunning
            }
        }
    }

    func stopSession() {
        sessionQueue.async { [weak self] in
            guard let self, self.session.isRunning else { return }
            self.session.stopRunning()
            DispatchQueue.main.async {
                self.isSessionRunning = false
            }
        }
    }

    // MARK: - Recording

    func startRecording() {
        guard !isRecording else { return }

        let outputFileName = "swing_\(UUID().uuidString).mov"
        let outputURL = FileManager.default.urls(
            for: .documentDirectory, in: .userDomainMask
        )[0].appendingPathComponent(outputFileName)

        sessionQueue.async { [weak self] in
            guard let self else { return }
            self.movieFileOutput.startRecording(to: outputURL, recordingDelegate: self)
            DispatchQueue.main.async {
                self.isRecording = true
            }
        }
    }

    func stopRecording() {
        guard isRecording else { return }
        sessionQueue.async { [weak self] in
            self?.movieFileOutput.stopRecording()
        }
    }

    // MARK: - Slow Motion Playback Support

    func setSlowMotionMode(enabled: Bool) {
        guard let device = videoDeviceInput?.device else { return }
        do {
            try device.lockForConfiguration()
            if enabled {
                // 240fps for slow motion if available
                if let format = device.formats.first(where: { format in
                    let ranges = format.videoSupportedFrameRateRanges
                    return ranges.contains { $0.maxFrameRate >= 240 }
                }) {
                    device.activeFormat = format
                    device.activeVideoMinFrameDuration = CMTime(value: 1, timescale: 240)
                    device.activeVideoMaxFrameDuration = CMTime(value: 1, timescale: 240)
                } else {
                    // Fall back to 120fps
                    device.activeVideoMinFrameDuration = CMTime(value: 1, timescale: 120)
                    device.activeVideoMaxFrameDuration = CMTime(value: 1, timescale: 120)
                }
            } else {
                device.activeVideoMinFrameDuration = CMTime(value: 1, timescale: 60)
                device.activeVideoMaxFrameDuration = CMTime(value: 1, timescale: 60)
            }
            device.unlockForConfiguration()
        } catch {
            // Fall back to default
        }
    }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate

extension CameraService: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)

        DispatchQueue.main.async {
            self.currentFrame = pixelBuffer
        }

        onFrameCaptured?(pixelBuffer, timestamp)
    }
}

// MARK: - AVCaptureFileOutputRecordingDelegate

extension CameraService: AVCaptureFileOutputRecordingDelegate {
    func fileOutput(
        _ output: AVCaptureFileOutput,
        didFinishRecordingTo outputFileURL: URL,
        from connections: [AVCaptureConnection],
        error: Error?
    ) {
        DispatchQueue.main.async {
            self.isRecording = false
            if let error {
                self.error = .recordingFailed(error.localizedDescription)
            } else {
                self.recordedVideoURL = outputFileURL
            }
        }
    }
}
