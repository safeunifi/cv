import Foundation

/// Complete analysis of a golf swing
struct SwingAnalysis: Codable, Equatable {
    var phases: [SwingPhase: PhaseAnalysis]
    var overallScore: Int // 0-100
    var faults: [SwingFault]
    var strengths: [String]
    var recommendations: [DrillRecommendation]
    var tempo: SwingTempo

    var scoreGrade: String {
        switch overallScore {
        case 90...100: return "Excellent"
        case 80..<90: return "Very Good"
        case 70..<80: return "Good"
        case 60..<70: return "Fair"
        case 50..<60: return "Needs Work"
        default: return "Beginner"
        }
    }
}

// MARK: - Swing Phases

enum SwingPhase: String, Codable, CaseIterable, Identifiable {
    case address = "Address"
    case takeaway = "Takeaway"
    case backswing = "Backswing"
    case topOfBackswing = "Top of Backswing"
    case downswing = "Downswing"
    case impact = "Impact"
    case followThrough = "Follow Through"
    case finish = "Finish"

    var id: String { rawValue }

    var framePercentage: ClosedRange<Double> {
        switch self {
        case .address: return 0.0...0.10
        case .takeaway: return 0.10...0.25
        case .backswing: return 0.25...0.40
        case .topOfBackswing: return 0.40...0.50
        case .downswing: return 0.50...0.70
        case .impact: return 0.70...0.75
        case .followThrough: return 0.75...0.90
        case .finish: return 0.90...1.0
        }
    }
}

/// Analysis for a specific swing phase
struct PhaseAnalysis: Codable, Equatable {
    var score: Int // 0-100
    var keyAngles: [String: Double]
    var observations: [String]
    var frameTimestamp: Double
}

// MARK: - Swing Faults

struct SwingFault: Codable, Equatable, Identifiable {
    var id: UUID
    var name: String
    var severity: Severity
    var phase: SwingPhase
    var description: String
    var correction: String

    enum Severity: String, Codable, CaseIterable {
        case minor = "Minor"
        case moderate = "Moderate"
        case major = "Major"

        var color: String {
            switch self {
            case .minor: return "yellow"
            case .moderate: return "orange"
            case .major: return "red"
            }
        }
    }

    init(name: String, severity: Severity, phase: SwingPhase, description: String, correction: String) {
        self.id = UUID()
        self.name = name
        self.severity = severity
        self.phase = phase
        self.description = description
        self.correction = correction
    }
}

// MARK: - Swing Tempo

struct SwingTempo: Codable, Equatable {
    var backswingDuration: Double
    var downswingDuration: Double
    var totalDuration: Double

    var ratio: Double {
        guard downswingDuration > 0 else { return 0 }
        return backswingDuration / downswingDuration
    }

    /// Ideal tempo ratio is approximately 3:1
    var ratioAssessment: String {
        switch ratio {
        case 2.5...3.5: return "Excellent tempo (close to 3:1)"
        case 2.0..<2.5: return "Slightly quick backswing"
        case 3.5..<4.5: return "Slightly slow backswing"
        case ..<2.0: return "Rushed tempo - slow down your backswing"
        default: return "Very slow backswing - try to be more athletic"
        }
    }
}

// MARK: - Drill Recommendation

struct DrillRecommendation: Codable, Equatable, Identifiable {
    var id: UUID
    var drillId: String
    var priority: Int // 1 = highest
    var reason: String

    init(drillId: String, priority: Int, reason: String) {
        self.id = UUID()
        self.drillId = drillId
        self.priority = priority
        self.reason = reason
    }
}
