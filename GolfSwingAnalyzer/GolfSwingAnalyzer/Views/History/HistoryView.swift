import SwiftUI
import SwiftData

/// View showing all recorded swing sessions
struct HistoryView: View {
    @Query(sort: \SwingSession.date, order: .reverse) private var sessions: [SwingSession]
    @Environment(\.modelContext) private var modelContext
    @State private var filterAngle: CameraAngle?
    @State private var sortOrder: HistoryViewModel.SortOrder = .newest

    private var filteredSessions: [SwingSession] {
        var result = sessions

        if let angle = filterAngle {
            result = result.filter { $0.cameraAngle == angle }
        }

        switch sortOrder {
        case .newest:
            result.sort { $0.date > $1.date }
        case .oldest:
            result.sort { $0.date < $1.date }
        case .highestScore:
            result.sort { ($0.analysis?.overallScore ?? 0) > ($1.analysis?.overallScore ?? 0) }
        case .lowestScore:
            result.sort { ($0.analysis?.overallScore ?? 0) < ($1.analysis?.overallScore ?? 0) }
        }

        return result
    }

    var body: some View {
        NavigationStack {
            Group {
                if sessions.isEmpty {
                    emptyStateView
                } else {
                    VStack(spacing: 0) {
                        // Stats summary
                        if sessions.count > 1 {
                            statsSummary
                                .padding()
                        }

                        // Filters
                        filterBar
                            .padding(.horizontal)

                        // Session list
                        List {
                            ForEach(filteredSessions) { session in
                                NavigationLink {
                                    SessionDetailView(session: session)
                                } label: {
                                    SessionRowView(session: session)
                                }
                            }
                            .onDelete(perform: deleteSessions)
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Swing History")
        }
    }

    // MARK: - Stats Summary

    private var statsSummary: some View {
        HStack(spacing: 16) {
            StatCard(
                title: "Sessions",
                value: "\(sessions.count)",
                icon: "video",
                color: .blue
            )

            StatCard(
                title: "Avg Score",
                value: averageScoreText,
                icon: "chart.bar",
                color: .green
            )

            StatCard(
                title: "Best",
                value: bestScoreText,
                icon: "star",
                color: .yellow
            )
        }
    }

    private var averageScoreText: String {
        let scores = sessions.compactMap { $0.analysis?.overallScore }
        guard !scores.isEmpty else { return "--" }
        return "\(scores.reduce(0, +) / scores.count)"
    }

    private var bestScoreText: String {
        let scores = sessions.compactMap { $0.analysis?.overallScore }
        guard let best = scores.max() else { return "--" }
        return "\(best)"
    }

    // MARK: - Filters

    private var filterBar: some View {
        HStack {
            Menu {
                Button("All Angles") { filterAngle = nil }
                ForEach(CameraAngle.allCases) { angle in
                    Button(angle.rawValue) { filterAngle = angle }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                    Text(filterAngle?.rawValue ?? "All Angles")
                        .font(.caption)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color(.systemGray6))
                .clipShape(Capsule())
            }

            Menu {
                ForEach(HistoryViewModel.SortOrder.allCases, id: \.self) { order in
                    Button(order.rawValue) { sortOrder = order }
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.up.arrow.down")
                    Text(sortOrder.rawValue)
                        .font(.caption)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color(.systemGray6))
                .clipShape(Capsule())
            }

            Spacer()
        }
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "figure.golf")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text("No Swings Recorded")
                .font(.title2.bold())
            Text("Start by recording your first swing in the Capture tab.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }

    // MARK: - Delete

    private func deleteSessions(at offsets: IndexSet) {
        for index in offsets {
            let session = filteredSessions[index]
            if let url = session.videoURL {
                try? FileManager.default.removeItem(at: url)
            }
            modelContext.delete(session)
        }
        try? modelContext.save()
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(value)
                .font(.system(.title3, design: .rounded).bold())
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Session Row View

struct SessionRowView: View {
    let session: SwingSession

    var body: some View {
        HStack(spacing: 12) {
            // Score circle
            ZStack {
                Circle()
                    .fill(scoreColor.opacity(0.15))
                    .frame(width: 50, height: 50)
                if let score = session.analysis?.overallScore {
                    Text("\(score)")
                        .font(.system(.body, design: .rounded).bold())
                        .foregroundStyle(scoreColor)
                } else {
                    Image(systemName: "questionmark")
                        .foregroundStyle(.secondary)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(session.cameraAngle.abbreviation)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.accentColor.opacity(0.15))
                        .foregroundStyle(.accentColor)
                        .clipShape(Capsule())

                    Text(session.clubType.rawValue)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Text(session.date, format: .dateTime.month().day().year().hour().minute())
                    .font(.caption)
                    .foregroundStyle(.secondary)

                if let faultCount = session.analysis?.faults.count, faultCount > 0 {
                    Text("\(faultCount) fault\(faultCount == 1 ? "" : "s") detected")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }

    private var scoreColor: Color {
        guard let score = session.analysis?.overallScore else { return .secondary }
        switch score {
        case 80...100: return .green
        case 60..<80: return .yellow
        case 40..<60: return .orange
        default: return .red
        }
    }
}

// MARK: - Session Detail View

struct SessionDetailView: View {
    let session: SwingSession

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Session info
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Label(session.cameraAngle.rawValue, systemImage: "video")
                        Spacer()
                        Label(session.clubType.rawValue, systemImage: "figure.golf")
                    }
                    .font(.subheadline)

                    HStack {
                        Label(session.date.formatted(.dateTime), systemImage: "calendar")
                        Spacer()
                        Label(String(format: "%.1fs", session.durationSeconds), systemImage: "clock")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Analysis
                if let analysis = session.analysis {
                    AnalysisDetailView(analysis: analysis)
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "wand.and.stars")
                            .font(.title)
                            .foregroundStyle(.secondary)
                        Text("No analysis available")
                            .foregroundStyle(.secondary)
                        Text("This swing was saved without analysis.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(40)
                }
            }
            .padding()
        }
        .navigationTitle("Session Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}
