import SwiftUI
import AVKit
import SwiftData

/// Post-recording review and analysis view
struct ReviewView: View {
    @ObservedObject var viewModel: CaptureViewModel
    var modelContext: ModelContext
    @Environment(\.dismiss) private var dismiss
    @State private var player: AVPlayer?
    @State private var playbackRate: Float = 1.0
    @State private var showAnalysis = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Video player
                if let url = viewModel.recordedVideoURL {
                    VideoPlayer(player: player ?? AVPlayer(url: url))
                        .frame(maxHeight: UIScreen.main.bounds.height * 0.45)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal)
                        .onAppear {
                            player = AVPlayer(url: url)
                        }
                }

                // Playback controls
                playbackControls
                    .padding(.vertical, 12)

                Divider()

                // Session info
                ScrollView {
                    VStack(spacing: 16) {
                        sessionInfoCard

                        // Analysis result or button
                        if let analysis = viewModel.analysisResult {
                            NavigationLink {
                                AnalysisDetailView(analysis: analysis)
                            } label: {
                                analysisPreviewCard(analysis)
                            }
                        } else if viewModel.isAnalyzing {
                            analyzingView
                        } else {
                            analyzeButton
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Review Swing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Discard") {
                        viewModel.resetForNewCapture()
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveSession()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }

    // MARK: - Playback Controls

    private var playbackControls: some View {
        HStack(spacing: 20) {
            // Speed controls
            ForEach([0.25, 0.5, 1.0], id: \.self) { rate in
                Button {
                    playbackRate = Float(rate)
                    player?.rate = playbackRate
                } label: {
                    Text(rate == 1.0 ? "1x" : "\(rate, specifier: "%.2g")x")
                        .font(.system(.callout, design: .monospaced))
                        .fontWeight(playbackRate == Float(rate) ? .bold : .regular)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(playbackRate == Float(rate) ? Color.accentColor : Color.secondary.opacity(0.2))
                        .foregroundStyle(playbackRate == Float(rate) ? .white : .primary)
                        .clipShape(Capsule())
                }
            }

            Spacer()

            // Play/Replay
            Button {
                player?.seek(to: .zero)
                player?.rate = playbackRate
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .font(.title3)
            }

            Button {
                if player?.rate == 0 {
                    player?.rate = playbackRate
                } else {
                    player?.pause()
                }
            } label: {
                Image(systemName: player?.rate == 0 ? "play.fill" : "pause.fill")
                    .font(.title3)
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Session Info

    private var sessionInfoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label(viewModel.cameraAngle.rawValue, systemImage: "video")
                Spacer()
                Label(viewModel.clubType.rawValue, systemImage: "figure.golf")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)

            HStack {
                Label(viewModel.formattedDuration, systemImage: "clock")
                Spacer()
                Label(viewModel.isSlowMotion ? "Slo-Mo" : "Standard", systemImage: "gauge.medium")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Analysis

    private var analyzeButton: some View {
        Button {
            Task {
                await viewModel.analyzeRecording()
            }
        } label: {
            HStack {
                Image(systemName: "wand.and.stars")
                Text("Analyze Swing")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.accentColor)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var analyzingView: some View {
        VStack(spacing: 12) {
            ProgressView()
                .controlSize(.large)
            Text("Analyzing your swing...")
                .font(.headline)
            Text("Detecting body positions and calculating angles")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(30)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func analysisPreviewCard(_ analysis: SwingAnalysis) -> some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Swing Score")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("\(analysis.overallScore)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(scoreColor(analysis.overallScore))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(analysis.scoreGrade)
                        .font(.title3.bold())
                        .foregroundStyle(scoreColor(analysis.overallScore))
                    Text("\(analysis.faults.count) faults found")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text("\(analysis.strengths.count) strengths")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            HStack {
                Text("Tap for full analysis")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func scoreColor(_ score: Int) -> Color {
        switch score {
        case 80...100: return .green
        case 60..<80: return .yellow
        case 40..<60: return .orange
        default: return .red
        }
    }

    // MARK: - Save

    private func saveSession() {
        guard let url = viewModel.recordedVideoURL else { return }

        let session = SwingSession(
            cameraAngle: viewModel.cameraAngle,
            videoFileName: url.lastPathComponent,
            durationSeconds: viewModel.recordingDuration,
            clubType: viewModel.clubType
        )
        session.analysis = viewModel.analysisResult
        modelContext.insert(session)
        try? modelContext.save()

        viewModel.resetForNewCapture()
    }
}
