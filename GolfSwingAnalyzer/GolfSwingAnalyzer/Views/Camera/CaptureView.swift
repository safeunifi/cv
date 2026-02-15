import SwiftUI
import AVFoundation

/// Main camera capture view for recording golf swings
struct CaptureView: View {
    @StateObject private var viewModel = CaptureViewModel()
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        NavigationStack {
            ZStack {
                // Camera preview
                if viewModel.cameraPermissionGranted {
                    CameraPreviewView(session: viewModel.cameraService.session)
                        .ignoresSafeArea()
                } else {
                    cameraPermissionView
                }

                // Overlays
                VStack {
                    // Top bar
                    topControlsBar

                    Spacer()

                    // Pose overlay
                    if !viewModel.poseOverlayPoints.isEmpty {
                        PoseOverlayView(
                            points: viewModel.poseOverlayPoints,
                            connections: viewModel.poseConnections
                        )
                    }

                    Spacer()

                    // Angle guide
                    if viewModel.showAngleGuide && !viewModel.isRecording {
                        AngleGuideView(cameraAngle: viewModel.cameraAngle)
                            .padding(.bottom, 8)
                    }

                    // Recording controls
                    bottomControlsBar
                }
            }
            .navigationTitle("")
            .navigationBarHidden(true)
            .task {
                await viewModel.setupCamera()
            }
            .onDisappear {
                viewModel.teardownCamera()
            }
            .sheet(isPresented: $viewModel.showReview) {
                ReviewView(viewModel: viewModel, modelContext: modelContext)
            }
            .alert("Error", isPresented: .init(
                get: { viewModel.error != nil },
                set: { if !$0 { viewModel.error = nil } }
            )) {
                Button("OK") { viewModel.error = nil }
            } message: {
                Text(viewModel.error ?? "")
            }
        }
    }

    // MARK: - Top Controls

    private var topControlsBar: some View {
        HStack {
            // Camera angle picker
            Menu {
                ForEach(CameraAngle.allCases) { angle in
                    Button(angle.rawValue) {
                        viewModel.cameraAngle = angle
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "video")
                    Text(viewModel.cameraAngle.abbreviation)
                        .fontWeight(.semibold)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
            }

            Spacer()

            // Recording indicator
            if viewModel.isRecording {
                HStack(spacing: 6) {
                    Circle()
                        .fill(.red)
                        .frame(width: 10, height: 10)
                    Text(viewModel.formattedDuration)
                        .font(.system(.body, design: .monospaced))
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
            }

            Spacer()

            // Club selector
            Menu {
                ForEach(ClubType.allCases) { club in
                    Button(club.rawValue) {
                        viewModel.clubType = club
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "figure.golf")
                    Text(viewModel.clubType.rawValue)
                        .fontWeight(.semibold)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
            }
        }
        .foregroundStyle(.white)
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - Bottom Controls

    private var bottomControlsBar: some View {
        HStack(spacing: 40) {
            // Slow motion toggle
            Button {
                viewModel.toggleSlowMotion()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: viewModel.isSlowMotion ? "gauge.with.dots.needle.67percent" : "gauge.with.dots.needle.33percent")
                        .font(.title2)
                    Text(viewModel.isSlowMotion ? "SLO-MO" : "Normal")
                        .font(.caption2)
                }
                .foregroundStyle(viewModel.isSlowMotion ? .yellow : .white)
            }

            // Record button
            Button {
                viewModel.toggleRecording()
            } label: {
                ZStack {
                    Circle()
                        .stroke(.white, lineWidth: 4)
                        .frame(width: 72, height: 72)

                    if viewModel.isRecording {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(.red)
                            .frame(width: 30, height: 30)
                    } else {
                        Circle()
                            .fill(.red)
                            .frame(width: 60, height: 60)
                    }
                }
            }

            // Guide toggle
            Button {
                viewModel.showAngleGuide.toggle()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: viewModel.showAngleGuide ? "rectangle.on.rectangle.fill" : "rectangle.on.rectangle")
                        .font(.title2)
                    Text("Guide")
                        .font(.caption2)
                }
                .foregroundStyle(viewModel.showAngleGuide ? .green : .white)
            }
        }
        .padding(.bottom, 30)
    }

    // MARK: - Permission View

    private var cameraPermissionView: some View {
        VStack(spacing: 20) {
            Image(systemName: "camera.fill")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text("Camera Access Required")
                .font(.title2.bold())
            Text("Swing Coach needs camera access to record and analyze your golf swing.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
                .padding(.horizontal, 40)
            Button("Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
    }
}

// MARK: - Camera Preview UIViewRepresentable

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> CameraPreviewUIView {
        let view = CameraPreviewUIView()
        view.previewLayer.session = session
        view.previewLayer.videoGravity = .resizeAspectFill
        return view
    }

    func updateUIView(_ uiView: CameraPreviewUIView, context: Context) {
        uiView.previewLayer.session = session
    }
}

class CameraPreviewUIView: UIView {
    override class var layerClass: AnyClass {
        AVCaptureVideoPreviewLayer.self
    }

    var previewLayer: AVCaptureVideoPreviewLayer {
        layer as! AVCaptureVideoPreviewLayer
    }
}
