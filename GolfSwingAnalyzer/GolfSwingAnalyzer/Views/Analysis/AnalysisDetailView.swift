import SwiftUI

/// Detailed swing analysis view showing all phases, faults, and recommendations
struct AnalysisDetailView: View {
    let analysis: SwingAnalysis
    @State private var selectedPhase: SwingPhase?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Score header
                scoreHeader

                // Tempo card
                tempoCard

                // Phase breakdown
                phaseBreakdown

                // Faults
                if !analysis.faults.isEmpty {
                    faultsSection
                }

                // Strengths
                if !analysis.strengths.isEmpty {
                    strengthsSection
                }

                // Recommended drills
                if !analysis.recommendations.isEmpty {
                    drillRecommendationsSection
                }
            }
            .padding()
        }
        .navigationTitle("Swing Analysis")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Score Header

    private var scoreHeader: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Color(.systemGray5), lineWidth: 12)
                    .frame(width: 140, height: 140)

                Circle()
                    .trim(from: 0, to: CGFloat(analysis.overallScore) / 100)
                    .stroke(
                        scoreGradient,
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 140, height: 140)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 2) {
                    Text("\(analysis.overallScore)")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                    Text(analysis.scoreGrade)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 8)
    }

    private var scoreGradient: LinearGradient {
        let color: Color = switch analysis.overallScore {
        case 80...100: .green
        case 60..<80: .yellow
        case 40..<60: .orange
        default: .red
        }
        return LinearGradient(
            colors: [color.opacity(0.7), color],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    // MARK: - Tempo

    private var tempoCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Swing Tempo", systemImage: "metronome")
                .font(.headline)

            HStack(spacing: 20) {
                VStack {
                    Text(String(format: "%.1fs", analysis.tempo.backswingDuration))
                        .font(.system(.title3, design: .monospaced).bold())
                    Text("Backswing")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Image(systemName: "arrow.right")
                    .foregroundStyle(.secondary)

                VStack {
                    Text(String(format: "%.1fs", analysis.tempo.downswingDuration))
                        .font(.system(.title3, design: .monospaced).bold())
                    Text("Downswing")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack {
                    Text(String(format: "%.1f:1", analysis.tempo.ratio))
                        .font(.system(.title2, design: .monospaced).bold())
                        .foregroundStyle(tempoColor)
                    Text("Ratio")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Text(analysis.tempo.ratioAssessment)
                .font(.callout)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var tempoColor: Color {
        analysis.tempo.ratio >= 2.5 && analysis.tempo.ratio <= 3.5 ? .green : .orange
    }

    // MARK: - Phase Breakdown

    private var phaseBreakdown: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Phase Breakdown", systemImage: "chart.bar")
                .font(.headline)

            ForEach(SwingPhase.allCases) { phase in
                if let phaseData = analysis.phases[phase] {
                    PhaseRowView(phase: phase, analysis: phaseData, isExpanded: selectedPhase == phase)
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3)) {
                                selectedPhase = selectedPhase == phase ? nil : phase
                            }
                        }
                }
            }
        }
    }

    // MARK: - Faults

    private var faultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Swing Faults", systemImage: "exclamationmark.triangle")
                .font(.headline)

            ForEach(analysis.faults) { fault in
                FaultCardView(fault: fault)
            }
        }
    }

    // MARK: - Strengths

    private var strengthsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Strengths", systemImage: "star.fill")
                .font(.headline)
                .foregroundStyle(.primary)

            ForEach(analysis.strengths, id: \.self) { strength in
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text(strength)
                        .font(.callout)
                }
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Drill Recommendations

    private var drillRecommendationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Recommended Drills", systemImage: "figure.golf")
                .font(.headline)

            ForEach(analysis.recommendations) { rec in
                if let drill = DrillLibrary.drill(withId: rec.drillId) {
                    NavigationLink {
                        DrillDetailView(drill: drill)
                    } label: {
                        DrillCardView(drill: drill, reason: rec.reason)
                    }
                }
            }
        }
    }
}

// MARK: - Phase Row View

struct PhaseRowView: View {
    let phase: SwingPhase
    let analysis: PhaseAnalysis
    let isExpanded: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(phase.rawValue)
                    .font(.subheadline.bold())

                Spacer()

                Text("\(analysis.score)")
                    .font(.system(.body, design: .rounded).bold())
                    .foregroundStyle(scoreColor)

                // Score bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(.systemGray5))
                        RoundedRectangle(cornerRadius: 4)
                            .fill(scoreColor)
                            .frame(width: geo.size.width * CGFloat(analysis.score) / 100)
                    }
                }
                .frame(width: 80, height: 8)

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if isExpanded {
                VStack(alignment: .leading, spacing: 6) {
                    // Key angles
                    if !analysis.keyAngles.isEmpty {
                        ForEach(analysis.keyAngles.sorted(by: { $0.key < $1.key }), id: \.key) { name, value in
                            HStack {
                                Text(name)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Text("\(Int(value))°")
                                    .font(.system(.caption, design: .monospaced).bold())
                            }
                        }
                    }

                    // Observations
                    ForEach(analysis.observations, id: \.self) { observation in
                        HStack(alignment: .top, spacing: 6) {
                            Image(systemName: "arrow.right.circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.accentColor)
                                .padding(.top, 2)
                            Text(observation)
                                .font(.caption)
                        }
                    }
                }
                .padding(.top, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private var scoreColor: Color {
        switch analysis.score {
        case 80...100: return .green
        case 60..<80: return .yellow
        case 40..<60: return .orange
        default: return .red
        }
    }
}

// MARK: - Fault Card View

struct FaultCardView: View {
    let fault: SwingFault

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: severityIcon)
                    .foregroundStyle(severityColor)
                Text(fault.name)
                    .font(.subheadline.bold())
                Spacer()
                Text(fault.severity.rawValue)
                    .font(.caption)
                    .fontWeight(.medium)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(severityColor.opacity(0.15))
                    .foregroundStyle(severityColor)
                    .clipShape(Capsule())
            }

            Text(fault.description)
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(alignment: .top, spacing: 6) {
                Image(systemName: "lightbulb.fill")
                    .foregroundStyle(.yellow)
                    .font(.caption)
                Text(fault.correction)
                    .font(.caption)
                    .foregroundStyle(.primary)
            }
            .padding(10)
            .background(Color.yellow.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .padding()
        .background(severityColor.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(severityColor.opacity(0.2), lineWidth: 1)
        )
    }

    private var severityIcon: String {
        switch fault.severity {
        case .minor: return "exclamationmark.circle"
        case .moderate: return "exclamationmark.triangle"
        case .major: return "exclamationmark.octagon"
        }
    }

    private var severityColor: Color {
        switch fault.severity {
        case .minor: return .yellow
        case .moderate: return .orange
        case .major: return .red
        }
    }
}
