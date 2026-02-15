import Foundation
import Vision

/// Core analysis engine that evaluates golf swing mechanics from pose data
final class SwingAnalyzer {

    // MARK: - Main Analysis

    /// Perform full swing analysis from collected pose frames
    func analyze(
        frames: [PoseFrame],
        cameraAngle: CameraAngle
    ) -> SwingAnalysis {
        guard frames.count > 10 else {
            return createMinimalAnalysis()
        }

        // 1. Detect swing phases
        let phaseFrames = identifyPhases(in: frames)

        // 2. Analyze each phase
        var phaseAnalyses: [SwingPhase: PhaseAnalysis] = [:]
        for (phase, phaseData) in phaseFrames {
            phaseAnalyses[phase] = analyzePhase(
                phase: phase,
                frames: phaseData,
                cameraAngle: cameraAngle
            )
        }

        // 3. Detect faults
        let faults = detectFaults(
            phaseAnalyses: phaseAnalyses,
            frames: frames,
            cameraAngle: cameraAngle
        )

        // 4. Identify strengths
        let strengths = identifyStrengths(phaseAnalyses: phaseAnalyses)

        // 5. Calculate tempo
        let tempo = calculateTempo(phaseFrames: phaseFrames)

        // 6. Calculate overall score
        let overallScore = calculateOverallScore(
            phaseAnalyses: phaseAnalyses,
            faults: faults,
            tempo: tempo
        )

        // 7. Generate drill recommendations
        let recommendations = DrillRecommendationEngine.recommend(for: faults)

        return SwingAnalysis(
            phases: phaseAnalyses,
            overallScore: overallScore,
            faults: faults,
            strengths: strengths,
            recommendations: recommendations,
            tempo: tempo
        )
    }

    // MARK: - Phase Identification

    private func identifyPhases(in frames: [PoseFrame]) -> [SwingPhase: [PoseFrame]] {
        var result: [SwingPhase: [PoseFrame]] = [:]
        let totalFrames = frames.count

        // Use frame percentages to assign phases
        for phase in SwingPhase.allCases {
            let range = phase.framePercentage
            let startIdx = Int(Double(totalFrames) * range.lowerBound)
            let endIdx = min(Int(Double(totalFrames) * range.upperBound), totalFrames - 1)

            if startIdx <= endIdx && startIdx < totalFrames {
                result[phase] = Array(frames[startIdx...endIdx])
            }
        }

        // Refine phase boundaries using pose data
        refinePhaseDetection(phases: &result, allFrames: frames)

        return result
    }

    private func refinePhaseDetection(
        phases: inout [SwingPhase: [PoseFrame]],
        allFrames: [PoseFrame]
    ) {
        // Detect top of backswing: frame where hands reach highest point
        var maxHandHeight: CGFloat = 0
        var topFrameIdx = allFrames.count / 2

        for (idx, frame) in allFrames.enumerated() {
            let leftWristY = frame.joints[.leftWrist]?.y ?? 0
            let rightWristY = frame.joints[.rightWrist]?.y ?? 0
            let maxWrist = max(CGFloat(leftWristY), CGFloat(rightWristY))

            if maxWrist > maxHandHeight {
                maxHandHeight = maxWrist
                topFrameIdx = idx
            }
        }

        // Detect impact: frame where hands are at their lowest point after top
        var minHandHeight: CGFloat = .infinity
        var impactFrameIdx = topFrameIdx

        for idx in topFrameIdx..<allFrames.count {
            let leftWristY = allFrames[idx].joints[.leftWrist]?.y ?? 1
            let rightWristY = allFrames[idx].joints[.rightWrist]?.y ?? 1
            let minWrist = min(CGFloat(leftWristY), CGFloat(rightWristY))

            if minWrist < minHandHeight {
                minHandHeight = minWrist
                impactFrameIdx = idx
            }
        }

        // Re-assign key phase frames using detected positions
        if let topFrame = allFrames[safe: topFrameIdx] {
            phases[.topOfBackswing] = [topFrame]
            if topFrameIdx > 0 {
                phases[.topOfBackswing]?.insert(allFrames[topFrameIdx - 1], at: 0)
            }
            if topFrameIdx + 1 < allFrames.count {
                phases[.topOfBackswing]?.append(allFrames[topFrameIdx + 1])
            }
        }

        if let impactFrame = allFrames[safe: impactFrameIdx] {
            phases[.impact] = [impactFrame]
            if impactFrameIdx > 0 {
                phases[.impact]?.insert(allFrames[impactFrameIdx - 1], at: 0)
            }
            if impactFrameIdx + 1 < allFrames.count {
                phases[.impact]?.append(allFrames[impactFrameIdx + 1])
            }
        }
    }

    // MARK: - Phase Analysis

    private func analyzePhase(
        phase: SwingPhase,
        frames: [PoseFrame],
        cameraAngle: CameraAngle
    ) -> PhaseAnalysis {
        guard let keyFrame = frames[safe: frames.count / 2] else {
            return PhaseAnalysis(score: 50, keyAngles: [:], observations: ["Insufficient data"], frameTimestamp: 0)
        }

        let angles = calculateAngles(for: keyFrame, cameraAngle: cameraAngle)
        var score = 100
        var observations: [String] = []

        // Evaluate angles against ideal ranges
        for (angleName, angleValue) in angles.allAngles {
            let eval = IdealRanges.evaluate(angle: angleName, value: angleValue, phase: phase)
            switch eval {
            case .ideal:
                break // No deduction
            case .acceptable:
                score -= 5
            case .poor:
                score -= 15
            case .notApplicable:
                break
            }
        }

        // Phase-specific observations
        switch phase {
        case .address:
            observations.append(contentsOf: analyzeAddress(angles: angles))
        case .topOfBackswing:
            observations.append(contentsOf: analyzeTop(angles: angles))
        case .impact:
            observations.append(contentsOf: analyzeImpact(angles: angles))
        case .finish:
            observations.append(contentsOf: analyzeFinish(angles: angles))
        default:
            break
        }

        if observations.isEmpty {
            observations.append("Position looks solid")
        }

        return PhaseAnalysis(
            score: max(0, min(100, score)),
            keyAngles: angles.allAngles,
            observations: observations,
            frameTimestamp: keyFrame.timestamp
        )
    }

    // MARK: - Angle Calculations

    func calculateAngles(for frame: PoseFrame, cameraAngle: CameraAngle) -> SwingAngles {
        var angles = SwingAngles()

        let joints = frame.joints

        // Spine angle (from hip center to neck)
        if let hip = joints[.root],
           let neck = joints[.neck] {
            angles.spineAngle = calculateAngleFromVertical(
                point1: CGPoint(x: CGFloat(hip.x), y: CGFloat(hip.y)),
                point2: CGPoint(x: CGFloat(neck.x), y: CGFloat(neck.y))
            )
        }

        // Knee flex (using hip-knee-ankle angle)
        if let hip = joints[.leftHip],
           let knee = joints[.leftKnee],
           let ankle = joints[.leftAnkle] {
            let fullAngle = angleBetweenThreePoints(
                a: CGPoint(x: CGFloat(hip.x), y: CGFloat(hip.y)),
                b: CGPoint(x: CGFloat(knee.x), y: CGFloat(knee.y)),
                c: CGPoint(x: CGFloat(ankle.x), y: CGFloat(ankle.y))
            )
            angles.kneeFlex = 180 - fullAngle
        }

        // Hip bend
        if let hip = joints[.root],
           let knee = joints[.leftKnee],
           let neck = joints[.neck] {
            angles.hipBend = angleBetweenThreePoints(
                a: CGPoint(x: CGFloat(neck.x), y: CGFloat(neck.y)),
                b: CGPoint(x: CGFloat(hip.x), y: CGFloat(hip.y)),
                c: CGPoint(x: CGFloat(knee.x), y: CGFloat(knee.y))
            )
        }

        // Shoulder turn (based on camera angle)
        if cameraAngle == .downTheLine,
           let leftShoulder = joints[.leftShoulder],
           let rightShoulder = joints[.rightShoulder] {
            let shoulderLine = abs(CGFloat(leftShoulder.x) - CGFloat(rightShoulder.x))
            // Approximate turn angle from DTL view
            angles.shoulderTurn = asin(min(1.0, Double(shoulderLine) * 2.5)) * (180 / .pi)
        }

        if cameraAngle == .faceOn,
           let leftShoulder = joints[.leftShoulder],
           let rightShoulder = joints[.rightShoulder] {
            let dx = CGFloat(rightShoulder.x) - CGFloat(leftShoulder.x)
            let dy = CGFloat(rightShoulder.y) - CGFloat(leftShoulder.y)
            angles.shoulderTurn = abs(atan2(Double(dy), Double(dx))) * (180 / .pi)
        }

        // Hip turn
        if let leftHip = joints[.leftHip],
           let rightHip = joints[.rightHip] {
            if cameraAngle == .downTheLine {
                let hipLine = abs(CGFloat(leftHip.x) - CGFloat(rightHip.x))
                angles.hipTurn = asin(min(1.0, Double(hipLine) * 2.5)) * (180 / .pi)
            } else {
                let dx = CGFloat(rightHip.x) - CGFloat(leftHip.x)
                let dy = CGFloat(rightHip.y) - CGFloat(leftHip.y)
                angles.hipTurn = abs(atan2(Double(dy), Double(dx))) * (180 / .pi)
            }
        }

        // X-Factor
        if let shoulder = angles.shoulderTurn, let hip = angles.hipTurn {
            angles.xFactor = abs(shoulder - hip)
        }

        // Lead arm angle (left arm for right-handed golfer)
        if let shoulder = joints[.leftShoulder],
           let elbow = joints[.leftElbow],
           let wrist = joints[.leftWrist] {
            angles.leftArmAngle = angleBetweenThreePoints(
                a: CGPoint(x: CGFloat(shoulder.x), y: CGFloat(shoulder.y)),
                b: CGPoint(x: CGFloat(elbow.x), y: CGFloat(elbow.y)),
                c: CGPoint(x: CGFloat(wrist.x), y: CGFloat(wrist.y))
            )
        }

        // Wrist hinge
        if let elbow = joints[.leftElbow],
           let wrist = joints[.leftWrist] {
            let wristAngle = calculateAngleFromVertical(
                point1: CGPoint(x: CGFloat(elbow.x), y: CGFloat(elbow.y)),
                point2: CGPoint(x: CGFloat(wrist.x), y: CGFloat(wrist.y))
            )
            angles.wristHinge = wristAngle
        }

        // Head movement tracking
        if let nose = joints[.nose] {
            angles.headMovement = Double(abs(CGFloat(nose.x) - 0.5)) * 10 // Normalized
        }

        return angles
    }

    // MARK: - Geometry Helpers

    private func angleBetweenThreePoints(a: CGPoint, b: CGPoint, c: CGPoint) -> Double {
        let ba = CGPoint(x: a.x - b.x, y: a.y - b.y)
        let bc = CGPoint(x: c.x - b.x, y: c.y - b.y)

        let dotProduct = ba.x * bc.x + ba.y * bc.y
        let magBA = sqrt(ba.x * ba.x + ba.y * ba.y)
        let magBC = sqrt(bc.x * bc.x + bc.y * bc.y)

        guard magBA > 0 && magBC > 0 else { return 0 }

        let cosAngle = max(-1, min(1, dotProduct / (magBA * magBC)))
        return acos(cosAngle) * (180 / .pi)
    }

    private func calculateAngleFromVertical(point1: CGPoint, point2: CGPoint) -> Double {
        let dx = Double(point2.x - point1.x)
        let dy = Double(point2.y - point1.y)
        return abs(atan2(dx, dy)) * (180 / .pi)
    }

    // MARK: - Phase-Specific Analysis

    private func analyzeAddress(angles: SwingAngles) -> [String] {
        var observations: [String] = []

        if let spine = angles.spineAngle {
            if spine < 25 {
                observations.append("Standing too upright at address. More spine tilt needed.")
            } else if spine > 35 {
                observations.append("Too much forward bend. Stand slightly taller.")
            }
        }

        if let knee = angles.kneeFlex {
            if knee < 15 {
                observations.append("Legs too straight. Add athletic flex to knees.")
            } else if knee > 25 {
                observations.append("Excessive knee bend. Straighten slightly for better rotation.")
            }
        }

        return observations
    }

    private func analyzeTop(angles: SwingAngles) -> [String] {
        var observations: [String] = []

        if let shoulder = angles.shoulderTurn {
            if shoulder < 85 {
                observations.append("Incomplete shoulder turn (\(Int(shoulder))°). Try to rotate more for power.")
            } else if shoulder > 100 {
                observations.append("Over-rotation at the top. May cause inconsistency.")
            }
        }

        if let xFactor = angles.xFactor {
            if xFactor < 35 {
                observations.append("Low X-Factor (\(Int(xFactor))°). More separation between shoulders and hips needed.")
            } else if xFactor > 55 {
                observations.append("Excellent X-Factor (\(Int(xFactor))°), but ensure you can control this range.")
            }
        }

        if let leadArm = angles.leftArmAngle {
            if leadArm < 160 {
                observations.append("Lead arm bending at the top (\(Int(leadArm))°). Focus on keeping it straighter.")
            }
        }

        return observations
    }

    private func analyzeImpact(angles: SwingAngles) -> [String] {
        var observations: [String] = []

        if let spine = angles.spineAngle {
            if spine < 20 {
                observations.append("Early extension detected. Maintain your spine angle through impact.")
            }
        }

        if let headMove = angles.headMovement {
            if headMove > 3 {
                observations.append("Significant head movement. Focus on keeping your head steady.")
            }
        }

        return observations
    }

    private func analyzeFinish(angles: SwingAngles) -> [String] {
        var observations: [String] = []

        if let shoulder = angles.shoulderTurn {
            if shoulder < 160 {
                observations.append("Incomplete follow-through. Rotate fully to a balanced finish.")
            }
        }

        return observations
    }

    // MARK: - Fault Detection

    private func detectFaults(
        phaseAnalyses: [SwingPhase: PhaseAnalysis],
        frames: [PoseFrame],
        cameraAngle: CameraAngle
    ) -> [SwingFault] {
        var faults: [SwingFault] = []

        // Check for early extension
        if let addressSpine = phaseAnalyses[.address]?.keyAngles["Spine Angle"],
           let impactSpine = phaseAnalyses[.impact]?.keyAngles["Spine Angle"] {
            let spineLoss = addressSpine - impactSpine
            if spineLoss > 10 {
                faults.append(SwingFault(
                    name: "Early Extension",
                    severity: spineLoss > 20 ? .major : .moderate,
                    phase: .downswing,
                    description: "You're losing \(Int(spineLoss))° of spine angle through impact. Your body is standing up too early.",
                    correction: "Focus on maintaining your spine angle throughout the downswing. Feel like your chest stays over the ball."
                ))
            }
        }

        // Check for swaying (lateral hip movement)
        if cameraAngle == .faceOn {
            let addressHipX = getAverageHipPosition(frames: frames, range: 0..<(frames.count / 10))
            let topHipX = getAverageHipPosition(frames: frames, range: (frames.count * 4/10)..<(frames.count * 5/10))
            let hipSway = abs(topHipX - addressHipX)

            if hipSway > 0.05 {
                faults.append(SwingFault(
                    name: "Hip Sway",
                    severity: hipSway > 0.10 ? .major : .moderate,
                    phase: .backswing,
                    description: "Excessive lateral hip movement during the backswing instead of rotation.",
                    correction: "Feel like your right hip (for right-handed) stays in place and rotates rather than sliding. Practice with your trail hip against a wall."
                ))
            }
        }

        // Check for casting (early release)
        if let topWrist = phaseAnalyses[.topOfBackswing]?.keyAngles["Wrist Hinge"],
           let midWrist = phaseAnalyses[.downswing]?.keyAngles["Wrist Hinge"] {
            if topWrist - midWrist > 30 {
                faults.append(SwingFault(
                    name: "Casting / Early Release",
                    severity: .major,
                    phase: .downswing,
                    description: "You're releasing your wrist angle too early in the downswing, losing power and accuracy.",
                    correction: "Maintain the wrist hinge longer into the downswing. Feel like you're pulling the grip end down toward the ball."
                ))
            }
        }

        // Check for insufficient shoulder turn
        if let shoulderTurn = phaseAnalyses[.topOfBackswing]?.keyAngles["Shoulder Turn"],
           shoulderTurn < 80 {
            faults.append(SwingFault(
                name: "Restricted Turn",
                severity: shoulderTurn < 70 ? .major : .moderate,
                phase: .backswing,
                description: "Shoulder turn of only \(Int(shoulderTurn))° (ideal: 85-100°). This limits power and consistency.",
                correction: "Focus on turning your lead shoulder behind the ball. Flexibility exercises can help increase your range."
            ))
        }

        // Check for chicken wing (bent lead arm through impact)
        if let impactArm = phaseAnalyses[.impact]?.keyAngles["Lead Arm"],
           impactArm < 160 {
            faults.append(SwingFault(
                name: "Chicken Wing",
                severity: impactArm < 140 ? .major : .moderate,
                phase: .impact,
                description: "Lead arm is bending through impact (\(Int(impactArm))°), causing inconsistent contact.",
                correction: "Practice keeping your lead arm extended through the hitting zone. The towel drill under both arms can help."
            ))
        }

        // Check for head movement
        if let headMove = phaseAnalyses[.impact]?.keyAngles["Head Movement"],
           headMove > 3 {
            faults.append(SwingFault(
                name: "Head Movement",
                severity: headMove > 5 ? .major : .minor,
                phase: .downswing,
                description: "Your head is moving excessively during the swing, affecting strike consistency.",
                correction: "Practice hitting balls with a friend holding a club shaft lightly on top of your head. Or practice in front of a mirror."
            ))
        }

        return faults.sorted { $0.severity == .major && $1.severity != .major }
    }

    private func getAverageHipPosition(frames: [PoseFrame], range: Range<Int>) -> CGFloat {
        let relevantFrames = Array(frames[range])
        let hipPositions = relevantFrames.compactMap { frame -> CGFloat? in
            guard let hip = frame.joints[.root] else { return nil }
            return CGFloat(hip.x)
        }
        guard !hipPositions.isEmpty else { return 0 }
        return hipPositions.reduce(0, +) / CGFloat(hipPositions.count)
    }

    // MARK: - Strengths

    private func identifyStrengths(phaseAnalyses: [SwingPhase: PhaseAnalysis]) -> [String] {
        var strengths: [String] = []

        if let addressScore = phaseAnalyses[.address]?.score, addressScore >= 80 {
            strengths.append("Good athletic posture at address")
        }

        if let topScore = phaseAnalyses[.topOfBackswing]?.score, topScore >= 80 {
            strengths.append("Solid position at the top of backswing")
        }

        if let shoulderTurn = phaseAnalyses[.topOfBackswing]?.keyAngles["Shoulder Turn"],
           shoulderTurn >= 85 && shoulderTurn <= 100 {
            strengths.append("Excellent shoulder turn (\(Int(shoulderTurn))°)")
        }

        if let xFactor = phaseAnalyses[.topOfBackswing]?.keyAngles["X-Factor"],
           xFactor >= 35 && xFactor <= 55 {
            strengths.append("Great X-Factor separation (\(Int(xFactor))°)")
        }

        if let impactScore = phaseAnalyses[.impact]?.score, impactScore >= 80 {
            strengths.append("Strong impact position")
        }

        if let leadArm = phaseAnalyses[.topOfBackswing]?.keyAngles["Lead Arm"],
           leadArm >= 170 {
            strengths.append("Excellent lead arm extension")
        }

        if strengths.isEmpty {
            strengths.append("Committed swing with good effort")
        }

        return strengths
    }

    // MARK: - Tempo

    private func calculateTempo(phaseFrames: [SwingPhase: [PoseFrame]]) -> SwingTempo {
        let backswingStart = phaseFrames[.takeaway]?.first?.timestamp ?? 0
        let topTimestamp = phaseFrames[.topOfBackswing]?.first?.timestamp ?? 0
        let impactTimestamp = phaseFrames[.impact]?.first?.timestamp ?? 0
        let finishTimestamp = phaseFrames[.finish]?.last?.timestamp ?? 0

        let backswingDuration = topTimestamp - backswingStart
        let downswingDuration = impactTimestamp - topTimestamp
        let totalDuration = finishTimestamp - backswingStart

        return SwingTempo(
            backswingDuration: max(0.1, backswingDuration),
            downswingDuration: max(0.1, downswingDuration),
            totalDuration: max(0.2, totalDuration)
        )
    }

    // MARK: - Scoring

    private func calculateOverallScore(
        phaseAnalyses: [SwingPhase: PhaseAnalysis],
        faults: [SwingFault],
        tempo: SwingTempo
    ) -> Int {
        // Weighted average of phase scores
        let weights: [SwingPhase: Double] = [
            .address: 0.10,
            .takeaway: 0.05,
            .backswing: 0.15,
            .topOfBackswing: 0.20,
            .downswing: 0.15,
            .impact: 0.25,
            .followThrough: 0.05,
            .finish: 0.05,
        ]

        var weightedScore = 0.0
        for (phase, weight) in weights {
            let score = Double(phaseAnalyses[phase]?.score ?? 50)
            weightedScore += score * weight
        }

        // Deduct for faults
        for fault in faults {
            switch fault.severity {
            case .minor: weightedScore -= 2
            case .moderate: weightedScore -= 5
            case .major: weightedScore -= 10
            }
        }

        // Tempo bonus/penalty
        if tempo.ratio >= 2.5 && tempo.ratio <= 3.5 {
            weightedScore += 5
        } else if tempo.ratio < 2.0 || tempo.ratio > 4.5 {
            weightedScore -= 5
        }

        return max(0, min(100, Int(weightedScore)))
    }

    private func createMinimalAnalysis() -> SwingAnalysis {
        SwingAnalysis(
            phases: [:],
            overallScore: 0,
            faults: [SwingFault(
                name: "Insufficient Data",
                severity: .minor,
                phase: .address,
                description: "Not enough frames captured for analysis",
                correction: "Try recording a longer video with better lighting"
            )],
            strengths: [],
            recommendations: [],
            tempo: SwingTempo(backswingDuration: 0, downswingDuration: 0, totalDuration: 0)
        )
    }
}

// MARK: - Array Safe Subscript

extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
