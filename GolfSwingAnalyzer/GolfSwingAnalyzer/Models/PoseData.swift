import Foundation
import Vision

/// Represents body pose data extracted from a single video frame
struct PoseFrame {
    var timestamp: Double
    var joints: [VNHumanBodyPoseObservation.JointName: JointPosition]

    struct JointPosition {
        var x: CGFloat
        var y: CGFloat
        var confidence: Float
    }
}

// MARK: - Key Angles for Golf Swing Analysis

struct SwingAngles {
    // Address & general posture
    var spineAngle: Double?         // Forward tilt of spine
    var kneeFlex: Double?           // Knee bend at address
    var hipBend: Double?            // Hip hinge angle

    // Backswing
    var shoulderTurn: Double?       // Shoulder rotation
    var hipTurn: Double?            // Hip rotation
    var xFactor: Double?            // Difference between shoulder and hip turn
    var leftArmAngle: Double?       // Lead arm straightness (for right-handed)
    var wristHinge: Double?         // Wrist cock angle

    // Downswing & Impact
    var hipSlide: Double?           // Lateral hip movement
    var shaftLean: Double?          // Forward shaft lean at impact
    var headMovement: Double?       // Head stability (lateral)
    var spineAngleRetention: Double? // How well spine angle is maintained

    // Follow Through
    var extensionAngle: Double?     // Arms extension post-impact
    var finishBalance: Double?      // Balance at finish position

    /// Returns a dictionary of all non-nil angles
    var allAngles: [String: Double] {
        var result: [String: Double] = [:]
        if let v = spineAngle { result["Spine Angle"] = v }
        if let v = kneeFlex { result["Knee Flex"] = v }
        if let v = hipBend { result["Hip Bend"] = v }
        if let v = shoulderTurn { result["Shoulder Turn"] = v }
        if let v = hipTurn { result["Hip Turn"] = v }
        if let v = xFactor { result["X-Factor"] = v }
        if let v = leftArmAngle { result["Lead Arm"] = v }
        if let v = wristHinge { result["Wrist Hinge"] = v }
        if let v = hipSlide { result["Hip Slide"] = v }
        if let v = shaftLean { result["Shaft Lean"] = v }
        if let v = headMovement { result["Head Movement"] = v }
        if let v = spineAngleRetention { result["Spine Retention"] = v }
        if let v = extensionAngle { result["Extension"] = v }
        if let v = finishBalance { result["Finish Balance"] = v }
        return result
    }
}

// MARK: - Ideal Ranges

struct IdealRanges {
    /// Ideal angle ranges for different swing positions (in degrees)
    static let address: [String: ClosedRange<Double>] = [
        "Spine Angle": 25...35,
        "Knee Flex": 15...25,
        "Hip Bend": 30...45,
    ]

    static let topOfBackswing: [String: ClosedRange<Double>] = [
        "Shoulder Turn": 85...100,
        "Hip Turn": 40...55,
        "X-Factor": 35...55,
        "Lead Arm": 170...185,    // Nearly straight
        "Wrist Hinge": 80...100,
    ]

    static let impact: [String: ClosedRange<Double>] = [
        "Spine Angle": 25...40,
        "Hip Turn": 35...50,       // Open to target
        "Shaft Lean": 5...15,      // Forward lean
        "Head Movement": 0...3,    // Inches, minimal
    ]

    static let finish: [String: ClosedRange<Double>] = [
        "Shoulder Turn": 160...180,
        "Finish Balance": 85...100,  // Percentage
    ]

    /// Check if an angle is within the ideal range for a given phase
    static func evaluate(angle: String, value: Double, phase: SwingPhase) -> AngleEvaluation {
        let ranges: [String: ClosedRange<Double>]
        switch phase {
        case .address:
            ranges = address
        case .topOfBackswing:
            ranges = topOfBackswing
        case .impact:
            ranges = impact
        case .finish:
            ranges = finish
        default:
            return .notApplicable
        }

        guard let idealRange = ranges[angle] else { return .notApplicable }

        if idealRange.contains(value) {
            return .ideal
        } else if value < idealRange.lowerBound {
            let deficit = idealRange.lowerBound - value
            return deficit > 15 ? .poor(direction: .under) : .acceptable(direction: .under)
        } else {
            let excess = value - idealRange.upperBound
            return excess > 15 ? .poor(direction: .over) : .acceptable(direction: .over)
        }
    }
}

enum AngleEvaluation {
    case ideal
    case acceptable(direction: Direction)
    case poor(direction: Direction)
    case notApplicable

    enum Direction {
        case over, under
    }
}
