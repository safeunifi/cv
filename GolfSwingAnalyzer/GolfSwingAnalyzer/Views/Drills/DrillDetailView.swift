import SwiftUI

/// Detailed view for a specific practice drill with step-by-step instructions
struct DrillDetailView: View {
    let drill: Drill
    @State private var completedSteps: Set<Int> = []

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                headerSection

                // Equipment
                if !drill.equipment.isEmpty {
                    equipmentSection
                }

                // Description
                Text(drill.description)
                    .font(.body)

                // Steps
                stepsSection

                // Reps
                repsSection

                // Key Focus
                keyFocusSection

                // Target faults
                if !drill.targetFaults.isEmpty {
                    targetFaultsSection
                }
            }
            .padding()
        }
        .navigationTitle(drill.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack(spacing: 16) {
            Image(systemName: drill.category.icon)
                .font(.largeTitle)
                .foregroundStyle(.accentColor)
                .frame(width: 64, height: 64)
                .background(Color.accentColor.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

            VStack(alignment: .leading, spacing: 4) {
                Text(drill.category.rawValue)
                    .font(.subheadline)
                    .foregroundStyle(.accentColor)

                HStack(spacing: 8) {
                    Label(drill.difficulty.rawValue, systemImage: "chart.bar")
                        .font(.caption)
                        .foregroundStyle(difficultyColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(difficultyColor.opacity(0.1))
                        .clipShape(Capsule())
                }
            }
        }
    }

    // MARK: - Equipment

    private var equipmentSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Equipment Needed", systemImage: "wrench.and.screwdriver")
                .font(.headline)

            FlowLayout(spacing: 8) {
                ForEach(drill.equipment, id: \.self) { item in
                    Text(item)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color(.systemGray6))
                        .clipShape(Capsule())
                }
            }
        }
    }

    // MARK: - Steps

    private var stepsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Steps", systemImage: "list.number")
                .font(.headline)

            ForEach(Array(drill.steps.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: 12) {
                    Button {
                        if completedSteps.contains(index) {
                            completedSteps.remove(index)
                        } else {
                            completedSteps.insert(index)
                        }
                    } label: {
                        Image(systemName: completedSteps.contains(index) ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(completedSteps.contains(index) ? .green : .secondary)
                            .font(.title3)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Step \(index + 1)")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.accentColor)
                        Text(step)
                            .font(.callout)
                            .strikethrough(completedSteps.contains(index))
                            .foregroundStyle(completedSteps.contains(index) ? .secondary : .primary)
                    }
                }
                .padding(.vertical, 4)
            }

            if completedSteps.count == drill.steps.count {
                HStack {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                    Text("All steps completed!")
                        .fontWeight(.semibold)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.green.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    // MARK: - Reps

    private var repsSection: some View {
        HStack {
            Image(systemName: "repeat")
                .foregroundStyle(.accentColor)
            VStack(alignment: .leading) {
                Text("Recommended Reps")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(drill.reps)
                    .font(.callout.bold())
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Key Focus

    private var keyFocusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Key Focus", systemImage: "scope")
                .font(.headline)

            Text(drill.keyFocus)
                .font(.callout)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.accentColor.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    // MARK: - Target Faults

    private var targetFaultsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Targets These Faults", systemImage: "target")
                .font(.headline)

            FlowLayout(spacing: 8) {
                ForEach(drill.targetFaults, id: \.self) { fault in
                    Text(fault)
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.orange.opacity(0.15))
                        .foregroundStyle(.orange)
                        .clipShape(Capsule())
                }
            }
        }
    }

    private var difficultyColor: Color {
        switch drill.difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .advanced: return .red
        }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layoutSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layoutSubviews(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func layoutSubviews(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var maxHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if currentX + size.width > maxWidth && currentX > 0 {
                currentX = 0
                currentY += maxHeight + spacing
                maxHeight = 0
            }

            positions.append(CGPoint(x: currentX, y: currentY))
            currentX += size.width + spacing
            maxHeight = max(maxHeight, size.height)
            totalHeight = currentY + maxHeight
        }

        return (CGSize(width: maxWidth, height: totalHeight), positions)
    }
}
