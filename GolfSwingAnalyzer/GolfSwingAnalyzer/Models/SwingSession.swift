import Foundation
import SwiftData

/// Represents a single recorded golf swing session
@Model
final class SwingSession {
    var id: UUID
    var date: Date
    var cameraAngle: CameraAngle
    var videoFileName: String
    var durationSeconds: Double
    var clubType: ClubType
    var analysis: SwingAnalysis?
    var notes: String

    init(
        cameraAngle: CameraAngle,
        videoFileName: String,
        durationSeconds: Double,
        clubType: ClubType = .sevenIron,
        notes: String = ""
    ) {
        self.id = UUID()
        self.date = Date()
        self.cameraAngle = cameraAngle
        self.videoFileName = videoFileName
        self.durationSeconds = durationSeconds
        self.clubType = clubType
        self.notes = notes
    }

    var videoURL: URL? {
        let documentsPath = FileManager.default.urls(
            for: .documentDirectory, in: .userDomainMask
        ).first
        return documentsPath?.appendingPathComponent(videoFileName)
    }
}

// MARK: - Camera Angle

enum CameraAngle: String, Codable, CaseIterable, Identifiable {
    case downTheLine = "Down the Line"
    case faceOn = "Face On"

    var id: String { rawValue }

    var abbreviation: String {
        switch self {
        case .downTheLine: return "DTL"
        case .faceOn: return "FO"
        }
    }

    var description: String {
        switch self {
        case .downTheLine:
            return "Camera positioned behind the golfer, aligned with the target line"
        case .faceOn:
            return "Camera positioned facing the golfer, perpendicular to the target line"
        }
    }

    var setupInstructions: String {
        switch self {
        case .downTheLine:
            return "Place your phone directly behind you, aligned with your target line. Position at hand height, about 10 feet back."
        case .faceOn:
            return "Place your phone facing you, perpendicular to your target line. Position at waist height, about 10 feet away."
        }
    }
}

// MARK: - Club Type

enum ClubType: String, Codable, CaseIterable, Identifiable {
    case driver = "Driver"
    case threeWood = "3 Wood"
    case fiveWood = "5 Wood"
    case hybrid = "Hybrid"
    case fourIron = "4 Iron"
    case fiveIron = "5 Iron"
    case sixIron = "6 Iron"
    case sevenIron = "7 Iron"
    case eightIron = "8 Iron"
    case nineIron = "9 Iron"
    case pitchingWedge = "PW"
    case gapWedge = "GW"
    case sandWedge = "SW"
    case lobWedge = "LW"
    case putter = "Putter"

    var id: String { rawValue }

    var category: String {
        switch self {
        case .driver, .threeWood, .fiveWood: return "Woods"
        case .hybrid: return "Hybrids"
        case .fourIron, .fiveIron, .sixIron, .sevenIron, .eightIron, .nineIron: return "Irons"
        case .pitchingWedge, .gapWedge, .sandWedge, .lobWedge: return "Wedges"
        case .putter: return "Putter"
        }
    }
}
