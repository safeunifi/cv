import SwiftUI

/// Browse all available practice drills by category
struct DrillsView: View {
    @State private var selectedCategory: Drill.Category?
    @State private var searchText = ""

    private var filteredDrills: [Drill] {
        var drills = DrillLibrary.allDrills

        if let category = selectedCategory {
            drills = drills.filter { $0.category == category }
        }

        if !searchText.isEmpty {
            drills = drills.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                $0.targetFaults.contains { $0.localizedCaseInsensitiveContains(searchText) }
            }
        }

        return drills
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Category filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(
                            title: "All",
                            isSelected: selectedCategory == nil,
                            action: { selectedCategory = nil }
                        )

                        ForEach(Drill.Category.allCases) { category in
                            FilterChip(
                                title: category.rawValue,
                                icon: category.icon,
                                isSelected: selectedCategory == category,
                                action: { selectedCategory = category }
                            )
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }

                // Drill list
                List {
                    ForEach(filteredDrills) { drill in
                        NavigationLink {
                            DrillDetailView(drill: drill)
                        } label: {
                            DrillRowView(drill: drill)
                        }
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Practice Drills")
            .searchable(text: $searchText, prompt: "Search drills or faults")
        }
    }
}

// MARK: - Filter Chip

struct FilterChip: View {
    let title: String
    var icon: String?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if let icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(isSelected ? Color.accentColor : Color(.systemGray6))
            .foregroundStyle(isSelected ? .white : .primary)
            .clipShape(Capsule())
        }
    }
}

// MARK: - Drill Row View

struct DrillRowView: View {
    let drill: Drill

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: drill.category.icon)
                    .foregroundStyle(.accentColor)
                    .frame(width: 24)
                Text(drill.name)
                    .font(.headline)
            }

            Text(drill.description)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            HStack(spacing: 12) {
                Label(drill.difficulty.rawValue, systemImage: "chart.bar")
                    .font(.caption2)
                    .foregroundStyle(difficultyColor)

                if !drill.targetFaults.isEmpty {
                    Label(drill.targetFaults.first ?? "", systemImage: "target")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                }

                if !drill.equipment.isEmpty {
                    Label("\(drill.equipment.count) items", systemImage: "wrench.and.screwdriver")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var difficultyColor: Color {
        switch drill.difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .advanced: return .red
        }
    }
}

// MARK: - Drill Card View (for recommendations)

struct DrillCardView: View {
    let drill: Drill
    var reason: String?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: drill.category.icon)
                .font(.title2)
                .foregroundStyle(.accentColor)
                .frame(width: 44, height: 44)
                .background(Color.accentColor.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 4) {
                Text(drill.name)
                    .font(.subheadline.bold())
                    .foregroundStyle(.primary)
                if let reason {
                    Text(reason)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Text(drill.difficulty.rawValue)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color(.systemGray5))
                    .clipShape(Capsule())
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
