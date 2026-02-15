import SwiftUI
import SwiftData

/// ViewModel for swing history and session management
@MainActor
final class HistoryViewModel: ObservableObject {
    @Published var sessions: [SwingSession] = []
    @Published var selectedSession: SwingSession?
    @Published var filterAngle: CameraAngle?
    @Published var filterClub: ClubType?
    @Published var sortOrder: SortOrder = .newest

    enum SortOrder: String, CaseIterable {
        case newest = "Newest First"
        case oldest = "Oldest First"
        case highestScore = "Highest Score"
        case lowestScore = "Lowest Score"
    }

    var filteredSessions: [SwingSession] {
        var result = sessions

        if let angle = filterAngle {
            result = result.filter { $0.cameraAngle == angle }
        }
        if let club = filterClub {
            result = result.filter { $0.clubType == club }
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

    func deleteSession(_ session: SwingSession, context: ModelContext) {
        // Delete video file
        if let url = session.videoURL {
            try? FileManager.default.removeItem(at: url)
        }
        context.delete(session)
        try? context.save()
    }

    /// Average score over recent sessions
    var averageScore: Double? {
        let scores = sessions.compactMap { $0.analysis?.overallScore }
        guard !scores.isEmpty else { return nil }
        return Double(scores.reduce(0, +)) / Double(scores.count)
    }

    /// Most common fault across sessions
    var mostCommonFault: String? {
        let allFaults = sessions.flatMap { $0.analysis?.faults ?? [] }
        let faultCounts = Dictionary(grouping: allFaults, by: { $0.name })
            .mapValues { $0.count }
        return faultCounts.max(by: { $0.value < $1.value })?.key
    }
}
