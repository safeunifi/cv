import SwiftUI
import SwiftData
import Charts

/// Progress tracking view showing improvement over time
struct ProgressView: View {
    @Query(sort: \SwingSession.date) private var sessions: [SwingSession]

    private var analyzedSessions: [SwingSession] {
        sessions.filter { $0.analysis != nil }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                if analyzedSessions.count < 2 {
                    emptyState
                } else {
                    VStack(spacing: 20) {
                        scoreChart
                        faultTrends
                        improvementInsights
                    }
                    .padding()
                }
            }
            .navigationTitle("Progress")
        }
    }

    // MARK: - Score Chart

    private var scoreChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Score Over Time", systemImage: "chart.line.uptrend.xyaxis")
                .font(.headline)

            Chart {
                ForEach(analyzedSessions) { session in
                    if let score = session.analysis?.overallScore {
                        LineMark(
                            x: .value("Date", session.date),
                            y: .value("Score", score)
                        )
                        .foregroundStyle(.accentColor)
                        .interpolationMethod(.catmullRom)

                        PointMark(
                            x: .value("Date", session.date),
                            y: .value("Score", score)
                        )
                        .foregroundStyle(.accentColor)
                        .symbolSize(30)
                    }
                }

                // Average line
                if let avg = averageScore {
                    RuleMark(y: .value("Average", avg))
                        .foregroundStyle(.secondary.opacity(0.5))
                        .lineStyle(StrokeStyle(dash: [5, 5]))
                        .annotation(position: .trailing) {
                            Text("Avg: \(Int(avg))")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                }
            }
            .frame(height: 200)
            .chartYScale(domain: 0...100)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Fault Trends

    private var faultTrends: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Most Common Faults", systemImage: "exclamationmark.triangle")
                .font(.headline)

            let faultCounts = countFaults()

            if faultCounts.isEmpty {
                Text("No faults detected across your sessions.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            } else {
                Chart {
                    ForEach(faultCounts.prefix(5), id: \.name) { fault in
                        BarMark(
                            x: .value("Count", fault.count),
                            y: .value("Fault", fault.name)
                        )
                        .foregroundStyle(faultColor(fault.name))
                    }
                }
                .frame(height: CGFloat(min(faultCounts.count, 5)) * 44)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Insights

    private var improvementInsights: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Insights", systemImage: "lightbulb")
                .font(.headline)

            ForEach(generateInsights(), id: \.self) { insight in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "arrow.right.circle.fill")
                        .foregroundStyle(.accentColor)
                    Text(insight)
                        .font(.callout)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text("Track Your Progress")
                .font(.title2.bold())
            Text("Record and analyze at least 2 swings to start seeing your progress over time.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }

    // MARK: - Helpers

    private var averageScore: Double? {
        let scores = analyzedSessions.compactMap { $0.analysis?.overallScore }
        guard !scores.isEmpty else { return nil }
        return Double(scores.reduce(0, +)) / Double(scores.count)
    }

    private func countFaults() -> [(name: String, count: Int)] {
        let allFaults = analyzedSessions.flatMap { $0.analysis?.faults ?? [] }
        let grouped = Dictionary(grouping: allFaults, by: { $0.name })
        return grouped.map { (name: $0.key, count: $0.value.count) }
            .sorted { $0.count > $1.count }
    }

    private func faultColor(_ name: String) -> Color {
        switch name {
        case "Early Extension": return .red
        case "Hip Sway": return .orange
        case "Casting / Early Release": return .purple
        case "Restricted Turn": return .blue
        case "Chicken Wing": return .pink
        case "Head Movement": return .yellow
        default: return .gray
        }
    }

    private func generateInsights() -> [String] {
        var insights: [String] = []

        let scores = analyzedSessions.compactMap { $0.analysis?.overallScore }

        // Score trend
        if scores.count >= 3 {
            let recentScores = Array(scores.suffix(3))
            let olderScores = Array(scores.prefix(max(1, scores.count - 3)))
            let recentAvg = Double(recentScores.reduce(0, +)) / Double(recentScores.count)
            let olderAvg = Double(olderScores.reduce(0, +)) / Double(olderScores.count)

            if recentAvg > olderAvg + 5 {
                insights.append("Your scores are trending upward. Keep up the good work!")
            } else if recentAvg < olderAvg - 5 {
                insights.append("Your recent scores have dipped. Focus on the fundamentals in your next session.")
            } else {
                insights.append("Your scores have been consistent. Time to target specific improvements.")
            }
        }

        // Most improved area
        let faultCounts = countFaults()
        if let mostCommon = faultCounts.first {
            insights.append("Your most recurring fault is \"\(mostCommon.name)\" (\(mostCommon.count) occurrences). Focus your practice drills on this area.")
        }

        // Session frequency
        if let first = analyzedSessions.first?.date, let last = analyzedSessions.last?.date {
            let daysBetween = Calendar.current.dateComponents([.day], from: first, to: last).day ?? 0
            if daysBetween > 0 {
                let sessionsPerWeek = Double(analyzedSessions.count) / (Double(daysBetween) / 7.0)
                if sessionsPerWeek >= 3 {
                    insights.append("You're practicing frequently (about \(Int(sessionsPerWeek))x per week). Consistency leads to improvement.")
                } else if sessionsPerWeek >= 1 {
                    insights.append("You're averaging about \(Int(sessionsPerWeek)) session(s) per week. Try to increase to 2-3 for faster improvement.")
                }
            }
        }

        if insights.isEmpty {
            insights.append("Keep recording swings to unlock personalized insights.")
        }

        return insights
    }
}
