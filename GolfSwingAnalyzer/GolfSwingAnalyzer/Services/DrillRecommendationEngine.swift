import Foundation

/// Engine that maps detected swing faults to specific practice drills
struct DrillRecommendationEngine {

    static func recommend(for faults: [SwingFault]) -> [DrillRecommendation] {
        var recommendations: [DrillRecommendation] = []
        var addedDrillIds: Set<String> = []

        for (index, fault) in faults.enumerated() {
            let drillIds = drillsForFault(fault.name)
            for drillId in drillIds {
                if !addedDrillIds.contains(drillId) {
                    addedDrillIds.insert(drillId)
                    recommendations.append(DrillRecommendation(
                        drillId: drillId,
                        priority: index + 1,
                        reason: "Addresses: \(fault.name)"
                    ))
                }
            }
        }

        return recommendations
    }

    private static func drillsForFault(_ faultName: String) -> [String] {
        switch faultName {
        case "Early Extension":
            return ["wall_drill", "chair_drill", "belt_buckle_down"]
        case "Hip Sway":
            return ["hip_bump_wall", "alignment_stick_hips", "feet_together"]
        case "Casting / Early Release":
            return ["lag_towel_drill", "pump_drill", "split_hand_drill"]
        case "Restricted Turn":
            return ["shoulder_turn_chair", "cross_arm_rotation", "hip_mobility_stretch"]
        case "Chicken Wing":
            return ["towel_under_arms", "trail_arm_only", "impact_bag"]
        case "Head Movement":
            return ["mirror_head_steady", "hat_brim_focus", "short_swing_drill"]
        default:
            return ["alignment_fundamentals", "tempo_whoosh_drill"]
        }
    }
}

// MARK: - Drill Library

struct DrillLibrary {
    static let allDrills: [Drill] = [
        // Early Extension Drills
        Drill(
            id: "wall_drill",
            name: "Wall Sit Swing Drill",
            category: .posture,
            targetFaults: ["Early Extension"],
            difficulty: .beginner,
            equipment: ["Wall"],
            description: "Stand with your glutes touching a wall at address. Make practice swings while keeping your backside against the wall through impact.",
            steps: [
                "Set up with your glutes just touching a wall behind you",
                "Take your address position with proper spine tilt",
                "Make slow backswings, keeping contact with the wall",
                "Swing through to impact, maintaining wall contact",
                "Your glutes should stay on the wall until well after impact",
            ],
            reps: "3 sets of 10 swings",
            keyFocus: "Feel your glutes maintain wall contact through the hitting zone. If you lose contact, you're early extending.",
            videoSearchTerm: "golf wall drill early extension"
        ),
        Drill(
            id: "chair_drill",
            name: "Chair Behind Drill",
            category: .posture,
            targetFaults: ["Early Extension"],
            difficulty: .beginner,
            equipment: ["Chair or stool"],
            description: "Place a chair behind you so it touches your glutes at address. Swing without pushing the chair away.",
            steps: [
                "Place a chair or stool behind you at address",
                "Your glutes should lightly touch the front edge",
                "Make half to three-quarter swings",
                "Focus on not pushing the chair backward through impact",
                "Gradually increase swing speed as you maintain contact",
            ],
            reps: "3 sets of 10 swings",
            keyFocus: "The chair provides immediate feedback - if it moves, you're losing your posture.",
            videoSearchTerm: "golf chair drill posture"
        ),
        Drill(
            id: "belt_buckle_down",
            name: "Belt Buckle Down Drill",
            category: .posture,
            targetFaults: ["Early Extension"],
            difficulty: .intermediate,
            equipment: [],
            description: "Focus on keeping your belt buckle pointed at the ground through impact to maintain spine angle.",
            steps: [
                "Take your address position and note your belt buckle angle",
                "Make slow motion swings",
                "Through the downswing, feel like your belt buckle stays pointed at the ball",
                "Only allow your belt buckle to rise AFTER impact",
                "Build up speed gradually",
            ],
            reps: "20 practice swings, then hit 10 balls",
            keyFocus: "This feel prevents your pelvis from thrusting toward the ball.",
            videoSearchTerm: "golf belt buckle drill spine angle"
        ),

        // Hip Sway Drills
        Drill(
            id: "hip_bump_wall",
            name: "Hip Rotation Wall Drill",
            category: .rotation,
            targetFaults: ["Hip Sway"],
            difficulty: .beginner,
            equipment: ["Wall"],
            description: "Stand with your trail hip against a wall to learn rotation instead of lateral movement.",
            steps: [
                "Stand with your right hip (for right-handed) just touching a wall",
                "Take your golf posture",
                "Make a backswing - your hip should rotate against the wall, not slide along it",
                "Feel the pressure into the wall increase as you load into your trail side",
                "If your hip slides along the wall, you're swaying",
            ],
            reps: "3 sets of 15 rotations",
            keyFocus: "Your hip should feel like it's turning in a barrel, not sliding sideways.",
            videoSearchTerm: "golf hip sway wall drill"
        ),
        Drill(
            id: "alignment_stick_hips",
            name: "Alignment Stick Hip Gate",
            category: .rotation,
            targetFaults: ["Hip Sway"],
            difficulty: .intermediate,
            equipment: ["2 alignment sticks", "2 pool noodles or head covers"],
            description: "Create a gate with alignment sticks on either side of your hips to prevent lateral movement.",
            steps: [
                "Stick two alignment sticks in the ground just outside each hip",
                "Take your address position between the sticks",
                "Make swings without bumping either stick during the backswing",
                "On the downswing, a slight bump of the front stick is OK (hip bump toward target)",
                "Focus on turning, not sliding",
            ],
            reps: "Hit 20 balls with the gate in place",
            keyFocus: "The sticks give you instant feedback on any lateral movement.",
            videoSearchTerm: "golf alignment stick hip drill"
        ),
        Drill(
            id: "feet_together",
            name: "Feet Together Drill",
            category: .balance,
            targetFaults: ["Hip Sway", "Head Movement"],
            difficulty: .beginner,
            equipment: ["Golf club", "Golf balls"],
            description: "Hit balls with your feet together to promote rotation and eliminate sway.",
            steps: [
                "Place your feet together (touching)",
                "Use a 7 or 8 iron",
                "Make three-quarter swings hitting balls",
                "Focus on balance - you should finish without stumbling",
                "This forces rotation because sway would topple you",
            ],
            reps: "Hit 20-30 balls",
            keyFocus: "If you can stay balanced with feet together, you're rotating properly.",
            videoSearchTerm: "golf feet together drill"
        ),

        // Casting / Early Release Drills
        Drill(
            id: "lag_towel_drill",
            name: "Towel Snap Lag Drill",
            category: .power,
            targetFaults: ["Casting / Early Release"],
            difficulty: .intermediate,
            equipment: ["Hand towel"],
            description: "Swing a rolled-up towel to develop the feel of maintaining lag and releasing late.",
            steps: [
                "Roll up a hand towel and grip one end",
                "Make golf swing motions with the towel",
                "The towel should snap at the bottom of the swing (at the ball position)",
                "If the towel snaps too early, you're casting",
                "Focus on feeling the hands lead the towel through impact",
            ],
            reps: "3 sets of 20 swings",
            keyFocus: "The snap should happen at the ball, not before. Listen for the crack.",
            videoSearchTerm: "golf towel lag drill"
        ),
        Drill(
            id: "pump_drill",
            name: "Pump Drill",
            category: .power,
            targetFaults: ["Casting / Early Release"],
            difficulty: .intermediate,
            equipment: ["Golf club"],
            description: "Practice the transition move by pumping down from the top without releasing.",
            steps: [
                "Take the club to the top of your backswing",
                "Start the downswing but stop when your hands reach waist height",
                "Check: your wrists should still be fully hinged at this point",
                "Return to the top and repeat 2-3 times",
                "On the final pump, complete the swing and hit the ball",
            ],
            reps: "10 balls with 3 pumps each",
            keyFocus: "At waist height in the downswing, the club shaft should still be at 90° to your lead arm.",
            videoSearchTerm: "golf pump drill lag"
        ),
        Drill(
            id: "split_hand_drill",
            name: "Split Hand Drill",
            category: .power,
            targetFaults: ["Casting / Early Release"],
            difficulty: .advanced,
            equipment: ["Golf club"],
            description: "Grip with hands separated to feel proper sequencing and lag retention.",
            steps: [
                "Grip the club with your hands 2-3 inches apart",
                "Make half swings hitting balls",
                "The split grip makes it impossible to cast without feeling it",
                "Focus on the feeling of your lead hand pulling while trail hand maintains angle",
                "Gradually bring hands closer together",
            ],
            reps: "Hit 15 balls",
            keyFocus: "The gap between hands amplifies the feeling of proper lag and release.",
            videoSearchTerm: "golf split grip drill"
        ),

        // Restricted Turn Drills
        Drill(
            id: "shoulder_turn_chair",
            name: "Seated Rotation Drill",
            category: .rotation,
            targetFaults: ["Restricted Turn"],
            difficulty: .beginner,
            equipment: ["Chair", "Golf club"],
            description: "Sit in a chair and practice upper body rotation to improve shoulder turn.",
            steps: [
                "Sit in a chair with a club across your chest (arms crossed)",
                "Maintain your posture and rotate your shoulders to the right",
                "Try to get the club pointing at where the ball would be",
                "Hold for 2 seconds, then rotate through to the other side",
                "Keep your lower body relatively stable",
            ],
            reps: "3 sets of 10 rotations each way",
            keyFocus: "Sitting eliminates lower body compensation, isolating your thoracic rotation.",
            videoSearchTerm: "golf seated rotation drill shoulder turn"
        ),
        Drill(
            id: "cross_arm_rotation",
            name: "Cross-Arm Rotation Drill",
            category: .rotation,
            targetFaults: ["Restricted Turn"],
            difficulty: .beginner,
            equipment: [],
            description: "Practice full shoulder rotation with arms crossed to build range of motion.",
            steps: [
                "Stand in your golf posture with arms crossed over chest",
                "Rotate your shoulders as far as you can to the right (for right-handed)",
                "Your lead shoulder should move past the center of your chest",
                "Hold for 3 seconds at maximum rotation",
                "Slowly rotate through to a full finish position",
            ],
            reps: "3 sets of 10 each direction, daily",
            keyFocus: "Try to turn your back to the target. Imagine someone standing in front of you reading your name on the back of your shirt.",
            videoSearchTerm: "golf cross arm rotation drill"
        ),
        Drill(
            id: "hip_mobility_stretch",
            name: "90/90 Hip Mobility Stretch",
            category: .flexibility,
            targetFaults: ["Restricted Turn"],
            difficulty: .beginner,
            equipment: ["Mat or carpet"],
            description: "Improve hip mobility to allow for greater rotation in the golf swing.",
            steps: [
                "Sit on the ground with your lead leg bent 90° in front of you",
                "Trail leg bent 90° beside you",
                "Sit tall and gently rotate your torso over your front knee",
                "Hold for 30 seconds",
                "Switch sides and repeat",
            ],
            reps: "3 sets of 30 seconds each side",
            keyFocus: "Hip mobility directly affects how much you can turn. Do this daily for best results.",
            videoSearchTerm: "90/90 hip stretch golf"
        ),

        // Chicken Wing Drills
        Drill(
            id: "towel_under_arms",
            name: "Towel Under Arms Drill",
            category: .connection,
            targetFaults: ["Chicken Wing"],
            difficulty: .beginner,
            equipment: ["Small towel or headcover"],
            description: "Place a towel under both arms to maintain connection and prevent the chicken wing.",
            steps: [
                "Tuck a towel or headcover under both armpits",
                "Make half to three-quarter swings",
                "The towel should not fall out until well after impact",
                "If it falls out, your arms are disconnecting from your body",
                "Focus on keeping your elbows pointing down throughout the swing",
            ],
            reps: "Hit 20 balls",
            keyFocus: "Connected arms eliminate the chicken wing. The towel drops are your feedback.",
            videoSearchTerm: "golf towel under arms drill"
        ),
        Drill(
            id: "trail_arm_only",
            name: "Trail Arm Only Swings",
            category: .connection,
            targetFaults: ["Chicken Wing"],
            difficulty: .advanced,
            equipment: ["Golf club (short iron)"],
            description: "Swing with only your trail arm to develop proper release pattern.",
            steps: [
                "Grip a short iron with only your trail hand (right for right-handed)",
                "Support the club lightly with your lead hand on the shaft",
                "Make smooth half swings",
                "Focus on the trail arm extending through impact",
                "This teaches proper arm extension and release",
            ],
            reps: "15 swings, then 10 with both hands",
            keyFocus: "The trail arm teaches you how to release properly instead of holding on.",
            videoSearchTerm: "golf one arm drill trail arm"
        ),
        Drill(
            id: "impact_bag",
            name: "Impact Bag Drill",
            category: .impact,
            targetFaults: ["Chicken Wing", "Casting / Early Release"],
            difficulty: .intermediate,
            equipment: ["Impact bag or heavy duffle bag"],
            description: "Hit into an impact bag to feel proper arm extension and shaft lean at impact.",
            steps: [
                "Place an impact bag where the ball would be",
                "Make slow swings into the bag",
                "At impact, check: hands should be ahead of the club head",
                "Lead arm should be straight, not bent",
                "Hold the impact position for 3 seconds to memorize the feel",
            ],
            reps: "20 slow-motion impacts",
            keyFocus: "The bag stops your swing so you can check your position. Hands forward, arm straight.",
            videoSearchTerm: "golf impact bag drill"
        ),

        // Head Movement Drills
        Drill(
            id: "mirror_head_steady",
            name: "Mirror Head Stability Drill",
            category: .stability,
            targetFaults: ["Head Movement"],
            difficulty: .beginner,
            equipment: ["Full-length mirror"],
            description: "Watch yourself in a mirror to develop awareness of head position.",
            steps: [
                "Stand facing a mirror in your golf posture",
                "Note where your head is positioned relative to a background reference point",
                "Make slow backswings and downswings",
                "Your head should stay in the same spot (slight rotation is OK)",
                "If your head moves significantly, slow down and try again",
            ],
            reps: "3 sets of 10 slow swings",
            keyFocus: "Pick a spot on the mirror near your head as a reference. It shouldn't move more than an inch.",
            videoSearchTerm: "golf head still mirror drill"
        ),
        Drill(
            id: "hat_brim_focus",
            name: "Hat Brim Focus Drill",
            category: .stability,
            targetFaults: ["Head Movement"],
            difficulty: .beginner,
            equipment: ["Baseball cap"],
            description: "Use the brim of a hat as a visual guide to maintain head position.",
            steps: [
                "Wear a baseball cap while practicing",
                "At address, note where the brim of your hat points",
                "Make swings while trying to keep the brim pointed at the ball",
                "The brim is your reference - if it moves, your head is moving",
                "Slight rotation is fine, but vertical and lateral movement should be minimal",
            ],
            reps: "Hit 20 balls while monitoring hat brim",
            keyFocus: "The hat gives you a constant visual reference for head stability.",
            videoSearchTerm: "golf hat brim head still drill"
        ),
        Drill(
            id: "short_swing_drill",
            name: "9 to 3 Short Swing Drill",
            category: .stability,
            targetFaults: ["Head Movement", "Hip Sway"],
            difficulty: .beginner,
            equipment: ["Golf club", "Golf balls"],
            description: "Make abbreviated swings (9 o'clock to 3 o'clock) to build stability.",
            steps: [
                "Take a 7 iron and set up to a ball",
                "Make a backswing only to 9 o'clock (hands at hip height)",
                "Swing through to 3 o'clock (hands at hip height on follow through)",
                "Focus on solid contact and keeping your head perfectly still",
                "Gradually increase swing length as stability improves",
            ],
            reps: "30 balls with the short swing",
            keyFocus: "Small swings build the foundation. Master the 9-to-3 before going longer.",
            videoSearchTerm: "golf 9 to 3 drill"
        ),

        // General / Fundamentals
        Drill(
            id: "alignment_fundamentals",
            name: "Alignment Station Setup",
            category: .fundamentals,
            targetFaults: [],
            difficulty: .beginner,
            equipment: ["2 alignment sticks"],
            description: "Build a proper alignment station to ensure your setup is consistent.",
            steps: [
                "Place one alignment stick on the ground aimed at your target (for club path)",
                "Place a second stick parallel to the first, along your toe line",
                "Set up with your feet, hips, and shoulders parallel to the sticks",
                "Check your ball position (inside lead heel for driver, center for irons)",
                "Hit balls while maintaining this alignment",
            ],
            reps: "Use for every practice session",
            keyFocus: "Good alignment is the foundation. Most swing faults start with poor aim.",
            videoSearchTerm: "golf alignment station setup"
        ),
        Drill(
            id: "tempo_whoosh_drill",
            name: "Whoosh Drill for Tempo",
            category: .tempo,
            targetFaults: [],
            difficulty: .beginner,
            equipment: ["Golf club (flipped upside down)"],
            description: "Flip your club upside down and swing to develop proper tempo and sequencing.",
            steps: [
                "Hold your club by the head (grip end pointing down)",
                "Make full swings",
                "Listen for the 'whoosh' sound - it should be loudest at the bottom of the swing",
                "If the whoosh is at the top, you're casting and have poor tempo",
                "Try to match a 3:1 ratio (3 count back, 1 count through)",
            ],
            reps: "20 swings before each practice session",
            keyFocus: "The whoosh should happen at the ball, not before. This is pure tempo training.",
            videoSearchTerm: "golf whoosh drill tempo"
        ),
    ]

    /// Get a drill by its ID
    static func drill(withId id: String) -> Drill? {
        allDrills.first { $0.id == id }
    }

    /// Get all drills for a specific category
    static func drills(for category: Drill.Category) -> [Drill] {
        allDrills.filter { $0.category == category }
    }

    /// Get all drills that address a specific fault
    static func drills(forFault fault: String) -> [Drill] {
        allDrills.filter { $0.targetFaults.contains(fault) }
    }
}

// MARK: - Drill Model

struct Drill: Identifiable, Equatable {
    var id: String
    var name: String
    var category: Category
    var targetFaults: [String]
    var difficulty: Difficulty
    var equipment: [String]
    var description: String
    var steps: [String]
    var reps: String
    var keyFocus: String
    var videoSearchTerm: String

    enum Category: String, CaseIterable, Identifiable {
        case posture = "Posture"
        case rotation = "Rotation"
        case balance = "Balance"
        case power = "Power"
        case connection = "Connection"
        case impact = "Impact"
        case stability = "Stability"
        case flexibility = "Flexibility"
        case fundamentals = "Fundamentals"
        case tempo = "Tempo"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .posture: return "figure.stand"
            case .rotation: return "arrow.triangle.2.circlepath"
            case .balance: return "figure.walk"
            case .power: return "bolt.fill"
            case .connection: return "link"
            case .impact: return "circle.inset.filled"
            case .stability: return "scope"
            case .flexibility: return "figure.flexibility"
            case .fundamentals: return "checkmark.seal"
            case .tempo: return "metronome"
            }
        }
    }

    enum Difficulty: String, CaseIterable, Identifiable {
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"

        var id: String { rawValue }
    }
}
