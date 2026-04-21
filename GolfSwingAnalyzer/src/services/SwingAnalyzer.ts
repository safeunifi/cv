import { generateId as uuid } from '../utils/id';
import {
  CameraAngle,
  PoseFrame,
  SwingPhase,
  PhaseAnalysis,
  SwingFault,
  SwingTempo,
  SwingAnalysis,
  SwingAngles,
  SWING_PHASES,
  SwingPhasePercentages,
  anglesToRecord,
} from '../models/types';
import {
  angleBetweenThreePoints,
  angleFromVertical,
  evaluateAngle,
} from '../utils/geometry';
import { recommendDrills } from './DrillRecommendationEngine';

/**
 * Core swing analysis engine.
 * Processes pose frames to produce a full SwingAnalysis.
 */
export function analyzeSwing(
  frames: PoseFrame[],
  cameraAngle: CameraAngle,
): SwingAnalysis {
  if (frames.length < 10) {
    return createMinimalAnalysis();
  }

  // 1. Identify swing phases
  const phaseFrames = identifyPhases(frames);

  // 2. Analyze each phase
  const phaseAnalyses: Partial<Record<SwingPhase, PhaseAnalysis>> = {};
  for (const phase of SWING_PHASES) {
    const pFrames = phaseFrames[phase];
    if (pFrames && pFrames.length > 0) {
      phaseAnalyses[phase] = analyzePhase(phase, pFrames, cameraAngle);
    }
  }

  // 3. Detect faults
  const faults = detectFaults(phaseAnalyses, frames, cameraAngle);

  // 4. Identify strengths
  const strengths = identifyStrengths(phaseAnalyses);

  // 5. Calculate tempo
  const tempo = calculateTempo(phaseFrames);

  // 6. Overall score
  const overallScore = calculateOverallScore(phaseAnalyses, faults, tempo);

  // 7. Drill recommendations
  const recommendations = recommendDrills(faults);

  return {
    phases: phaseAnalyses,
    overallScore,
    faults,
    strengths,
    recommendations,
    tempo,
  };
}

// ─── Phase Identification ─────────────────────────────────

function identifyPhases(
  frames: PoseFrame[],
): Partial<Record<SwingPhase, PoseFrame[]>> {
  const result: Partial<Record<SwingPhase, PoseFrame[]>> = {};
  const total = frames.length;

  for (const phase of SWING_PHASES) {
    const [startPct, endPct] = SwingPhasePercentages[phase];
    const startIdx = Math.floor(total * startPct);
    const endIdx = Math.min(Math.floor(total * endPct), total - 1);
    if (startIdx <= endIdx) {
      result[phase] = frames.slice(startIdx, endIdx + 1);
    }
  }

  // Refine top of backswing: highest hand position
  let maxHandY = 0;
  let topIdx = Math.floor(total / 2);
  for (let i = 0; i < total; i++) {
    const lw = frames[i].joints.leftWrist?.y ?? 0;
    const rw = frames[i].joints.rightWrist?.y ?? 0;
    const maxW = Math.max(lw, rw);
    if (maxW > maxHandY) {
      maxHandY = maxW;
      topIdx = i;
    }
  }

  // Refine impact: lowest hand position after top
  let minHandY = Infinity;
  let impactIdx = topIdx;
  for (let i = topIdx; i < total; i++) {
    const lw = frames[i].joints.leftWrist?.y ?? 1;
    const rw = frames[i].joints.rightWrist?.y ?? 1;
    const minW = Math.min(lw, rw);
    if (minW < minHandY) {
      minHandY = minW;
      impactIdx = i;
    }
  }

  // Update key phases with refined frames
  const grabNear = (idx: number) => {
    const arr: PoseFrame[] = [];
    if (idx > 0) arr.push(frames[idx - 1]);
    arr.push(frames[idx]);
    if (idx + 1 < total) arr.push(frames[idx + 1]);
    return arr;
  };

  result.topOfBackswing = grabNear(topIdx);
  result.impact = grabNear(impactIdx);

  return result;
}

// ─── Phase Analysis ───────────────────────────────────────

function analyzePhase(
  phase: SwingPhase,
  frames: PoseFrame[],
  cameraAngle: CameraAngle,
): PhaseAnalysis {
  const keyFrame = frames[Math.floor(frames.length / 2)];
  if (!keyFrame) {
    return { score: 50, keyAngles: {}, observations: ['Insufficient data'], frameTimestamp: 0 };
  }

  const angles = calculateAngles(keyFrame, cameraAngle);
  const angleRecord = anglesToRecord(angles);
  let score = 100;
  const observations: string[] = [];

  // Evaluate against ideal ranges
  for (const [name, value] of Object.entries(angleRecord)) {
    const evaluation = evaluateAngle(name, value, phase);
    if (evaluation === 'acceptable') score -= 5;
    else if (evaluation === 'poor') score -= 15;
  }

  // Phase-specific observations
  switch (phase) {
    case 'address':
      observations.push(...analyzeAddress(angles));
      break;
    case 'topOfBackswing':
      observations.push(...analyzeTop(angles));
      break;
    case 'impact':
      observations.push(...analyzeImpact(angles));
      break;
    case 'finish':
      observations.push(...analyzeFinish(angles));
      break;
  }

  if (observations.length === 0) {
    observations.push('Position looks solid');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    keyAngles: angleRecord,
    observations,
    frameTimestamp: keyFrame.timestamp,
  };
}

// ─── Angle Calculations ───────────────────────────────────

export function calculateAngles(
  frame: PoseFrame,
  cameraAngle: CameraAngle,
): SwingAngles {
  const j = frame.joints;
  const angles: SwingAngles = {};

  // Spine angle
  if (j.root && j.neck) {
    angles.spineAngle = angleFromVertical(j.root, j.neck);
  }

  // Knee flex
  if (j.leftHip && j.leftKnee && j.leftAnkle) {
    const full = angleBetweenThreePoints(j.leftHip, j.leftKnee, j.leftAnkle);
    angles.kneeFlex = 180 - full;
  }

  // Hip bend
  if (j.neck && j.root && j.leftKnee) {
    angles.hipBend = angleBetweenThreePoints(j.neck, j.root, j.leftKnee);
  }

  // Shoulder turn
  if (j.leftShoulder && j.rightShoulder) {
    if (cameraAngle === 'dtl') {
      const shoulderLine = Math.abs(j.leftShoulder.x - j.rightShoulder.x);
      angles.shoulderTurn = Math.asin(Math.min(1, shoulderLine * 2.5)) * (180 / Math.PI);
    } else {
      const dx = j.rightShoulder.x - j.leftShoulder.x;
      const dy = j.rightShoulder.y - j.leftShoulder.y;
      angles.shoulderTurn = Math.abs(Math.atan2(dy, dx)) * (180 / Math.PI);
    }
  }

  // Hip turn
  if (j.leftHip && j.rightHip) {
    if (cameraAngle === 'dtl') {
      const hipLine = Math.abs(j.leftHip.x - j.rightHip.x);
      angles.hipTurn = Math.asin(Math.min(1, hipLine * 2.5)) * (180 / Math.PI);
    } else {
      const dx = j.rightHip.x - j.leftHip.x;
      const dy = j.rightHip.y - j.leftHip.y;
      angles.hipTurn = Math.abs(Math.atan2(dy, dx)) * (180 / Math.PI);
    }
  }

  // X-Factor
  if (angles.shoulderTurn != null && angles.hipTurn != null) {
    angles.xFactor = Math.abs(angles.shoulderTurn - angles.hipTurn);
  }

  // Lead arm angle
  if (j.leftShoulder && j.leftElbow && j.leftWrist) {
    angles.leftArmAngle = angleBetweenThreePoints(j.leftShoulder, j.leftElbow, j.leftWrist);
  }

  // Wrist hinge
  if (j.leftElbow && j.leftWrist) {
    angles.wristHinge = angleFromVertical(j.leftElbow, j.leftWrist);
  }

  // Head movement
  if (j.nose) {
    angles.headMovement = Math.abs(j.nose.x - 0.5) * 10;
  }

  return angles;
}

// ─── Phase-Specific Observation Helpers ───────────────────

function analyzeAddress(a: SwingAngles): string[] {
  const obs: string[] = [];
  if (a.spineAngle != null) {
    if (a.spineAngle < 25) obs.push('Standing too upright at address. More spine tilt needed.');
    else if (a.spineAngle > 35) obs.push('Too much forward bend. Stand slightly taller.');
  }
  if (a.kneeFlex != null) {
    if (a.kneeFlex < 15) obs.push('Legs too straight. Add athletic flex to knees.');
    else if (a.kneeFlex > 25) obs.push('Excessive knee bend. Straighten slightly for better rotation.');
  }
  return obs;
}

function analyzeTop(a: SwingAngles): string[] {
  const obs: string[] = [];
  if (a.shoulderTurn != null) {
    if (a.shoulderTurn < 85) obs.push(`Incomplete shoulder turn (${Math.round(a.shoulderTurn)}°). Try to rotate more for power.`);
    else if (a.shoulderTurn > 100) obs.push('Over-rotation at the top. May cause inconsistency.');
  }
  if (a.xFactor != null) {
    if (a.xFactor < 35) obs.push(`Low X-Factor (${Math.round(a.xFactor)}°). More separation between shoulders and hips needed.`);
    else if (a.xFactor > 55) obs.push(`Excellent X-Factor (${Math.round(a.xFactor)}°), but ensure you can control this range.`);
  }
  if (a.leftArmAngle != null && a.leftArmAngle < 160) {
    obs.push(`Lead arm bending at the top (${Math.round(a.leftArmAngle)}°). Focus on keeping it straighter.`);
  }
  return obs;
}

function analyzeImpact(a: SwingAngles): string[] {
  const obs: string[] = [];
  if (a.spineAngle != null && a.spineAngle < 20) {
    obs.push('Early extension detected. Maintain your spine angle through impact.');
  }
  if (a.headMovement != null && a.headMovement > 3) {
    obs.push('Significant head movement. Focus on keeping your head steady.');
  }
  return obs;
}

function analyzeFinish(a: SwingAngles): string[] {
  const obs: string[] = [];
  if (a.shoulderTurn != null && a.shoulderTurn < 160) {
    obs.push('Incomplete follow-through. Rotate fully to a balanced finish.');
  }
  return obs;
}

// ─── Fault Detection ──────────────────────────────────────

function detectFaults(
  phaseAnalyses: Partial<Record<SwingPhase, PhaseAnalysis>>,
  frames: PoseFrame[],
  cameraAngle: CameraAngle,
): SwingFault[] {
  const faults: SwingFault[] = [];

  // Early extension
  const addressSpine = phaseAnalyses.address?.keyAngles['Spine Angle'];
  const impactSpine = phaseAnalyses.impact?.keyAngles['Spine Angle'];
  if (addressSpine != null && impactSpine != null) {
    const loss = addressSpine - impactSpine;
    if (loss > 10) {
      faults.push({
        id: uuid(),
        name: 'Early Extension',
        severity: loss > 20 ? 'Major' : 'Moderate',
        phase: 'downswing',
        description: `You're losing ${Math.round(loss)}° of spine angle through impact. Your body is standing up too early.`,
        correction: 'Focus on maintaining your spine angle throughout the downswing. Feel like your chest stays over the ball.',
      });
    }
  }

  // Hip sway (face-on view)
  if (cameraAngle === 'faceOn' && frames.length > 10) {
    const tenth = Math.floor(frames.length / 10);
    const addressHipX = avgHipX(frames.slice(0, tenth));
    const topHipX = avgHipX(frames.slice(Math.floor(frames.length * 0.4), Math.floor(frames.length * 0.5)));
    const sway = Math.abs(topHipX - addressHipX);
    if (sway > 0.05) {
      faults.push({
        id: uuid(),
        name: 'Hip Sway',
        severity: sway > 0.10 ? 'Major' : 'Moderate',
        phase: 'backswing',
        description: 'Excessive lateral hip movement during the backswing instead of rotation.',
        correction: 'Feel like your right hip stays in place and rotates rather than slides. Practice with your trail hip against a wall.',
      });
    }
  }

  // Casting / early release
  const topWrist = phaseAnalyses.topOfBackswing?.keyAngles['Wrist Hinge'];
  const midWrist = phaseAnalyses.downswing?.keyAngles['Wrist Hinge'];
  if (topWrist != null && midWrist != null && topWrist - midWrist > 30) {
    faults.push({
      id: uuid(),
      name: 'Casting / Early Release',
      severity: 'Major',
      phase: 'downswing',
      description: "You're releasing your wrist angle too early in the downswing, losing power and accuracy.",
      correction: 'Maintain the wrist hinge longer into the downswing. Feel like you\'re pulling the grip end down toward the ball.',
    });
  }

  // Restricted turn
  const shoulderTurn = phaseAnalyses.topOfBackswing?.keyAngles['Shoulder Turn'];
  if (shoulderTurn != null && shoulderTurn < 80) {
    faults.push({
      id: uuid(),
      name: 'Restricted Turn',
      severity: shoulderTurn < 70 ? 'Major' : 'Moderate',
      phase: 'backswing',
      description: `Shoulder turn of only ${Math.round(shoulderTurn)}° (ideal: 85-100°). This limits power and consistency.`,
      correction: 'Focus on turning your lead shoulder behind the ball. Flexibility exercises can help increase your range.',
    });
  }

  // Chicken wing
  const impactArm = phaseAnalyses.impact?.keyAngles['Lead Arm'];
  if (impactArm != null && impactArm < 160) {
    faults.push({
      id: uuid(),
      name: 'Chicken Wing',
      severity: impactArm < 140 ? 'Major' : 'Moderate',
      phase: 'impact',
      description: `Lead arm is bending through impact (${Math.round(impactArm)}°), causing inconsistent contact.`,
      correction: 'Practice keeping your lead arm extended through the hitting zone. The towel drill under both arms can help.',
    });
  }

  // Head movement
  const headMove = phaseAnalyses.impact?.keyAngles['Head Movement'];
  if (headMove != null && headMove > 3) {
    faults.push({
      id: uuid(),
      name: 'Head Movement',
      severity: headMove > 5 ? 'Major' : 'Minor',
      phase: 'downswing',
      description: 'Your head is moving excessively during the swing, affecting strike consistency.',
      correction: 'Practice hitting balls with a friend holding a club shaft lightly on top of your head, or practice in front of a mirror.',
    });
  }

  // Sort: major faults first
  faults.sort((a, b) => {
    const order: Record<string, number> = { Major: 0, Moderate: 1, Minor: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  return faults;
}

function avgHipX(frames: PoseFrame[]): number {
  const xs = frames.map((f) => f.joints.root?.x).filter((x): x is number => x != null);
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// ─── Strengths ────────────────────────────────────────────

function identifyStrengths(
  phaseAnalyses: Partial<Record<SwingPhase, PhaseAnalysis>>,
): string[] {
  const strengths: string[] = [];

  if ((phaseAnalyses.address?.score ?? 0) >= 80) {
    strengths.push('Good athletic posture at address');
  }
  if ((phaseAnalyses.topOfBackswing?.score ?? 0) >= 80) {
    strengths.push('Solid position at the top of backswing');
  }

  const st = phaseAnalyses.topOfBackswing?.keyAngles['Shoulder Turn'];
  if (st != null && st >= 85 && st <= 100) {
    strengths.push(`Excellent shoulder turn (${Math.round(st)}°)`);
  }

  const xf = phaseAnalyses.topOfBackswing?.keyAngles['X-Factor'];
  if (xf != null && xf >= 35 && xf <= 55) {
    strengths.push(`Great X-Factor separation (${Math.round(xf)}°)`);
  }

  if ((phaseAnalyses.impact?.score ?? 0) >= 80) {
    strengths.push('Strong impact position');
  }

  const la = phaseAnalyses.topOfBackswing?.keyAngles['Lead Arm'];
  if (la != null && la >= 170) {
    strengths.push('Excellent lead arm extension');
  }

  if (strengths.length === 0) {
    strengths.push('Committed swing with good effort');
  }

  return strengths;
}

// ─── Tempo ────────────────────────────────────────────────

function calculateTempo(
  phaseFrames: Partial<Record<SwingPhase, PoseFrame[]>>,
): SwingTempo {
  const backswingStart = phaseFrames.takeaway?.[0]?.timestamp ?? 0;
  const topTs = phaseFrames.topOfBackswing?.[0]?.timestamp ?? 0;
  const impactTs = phaseFrames.impact?.[0]?.timestamp ?? 0;
  const finishTs = phaseFrames.finish?.[phaseFrames.finish.length - 1]?.timestamp ?? 0;

  const backDur = Math.max(0.1, topTs - backswingStart);
  const downDur = Math.max(0.1, impactTs - topTs);
  const totalDur = Math.max(0.2, finishTs - backswingStart);

  return {
    backswingDuration: backDur,
    downswingDuration: downDur,
    totalDuration: totalDur,
    ratio: downDur > 0 ? backDur / downDur : 0,
  };
}

export function tempoAssessment(ratio: number): string {
  if (ratio >= 2.5 && ratio <= 3.5) return 'Excellent tempo (close to 3:1)';
  if (ratio >= 2.0 && ratio < 2.5) return 'Slightly quick backswing';
  if (ratio > 3.5 && ratio < 4.5) return 'Slightly slow backswing';
  if (ratio < 2.0) return 'Rushed tempo - slow down your backswing';
  return 'Very slow backswing - try to be more athletic';
}

export function scoreGrade(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Beginner';
}

// ─── Overall Score ────────────────────────────────────────

function calculateOverallScore(
  phases: Partial<Record<SwingPhase, PhaseAnalysis>>,
  faults: SwingFault[],
  tempo: SwingTempo,
): number {
  const weights: Record<SwingPhase, number> = {
    address: 0.10,
    takeaway: 0.05,
    backswing: 0.15,
    topOfBackswing: 0.20,
    downswing: 0.15,
    impact: 0.25,
    followThrough: 0.05,
    finish: 0.05,
  };

  let weighted = 0;
  for (const phase of SWING_PHASES) {
    weighted += (phases[phase]?.score ?? 50) * weights[phase];
  }

  for (const f of faults) {
    if (f.severity === 'Minor') weighted -= 2;
    else if (f.severity === 'Moderate') weighted -= 5;
    else weighted -= 10;
  }

  if (tempo.ratio >= 2.5 && tempo.ratio <= 3.5) weighted += 5;
  else if (tempo.ratio < 2.0 || tempo.ratio > 4.5) weighted -= 5;

  return Math.max(0, Math.min(100, Math.round(weighted)));
}

// ─── Minimal Analysis (insufficient data) ─────────────────

function createMinimalAnalysis(): SwingAnalysis {
  return {
    phases: {},
    overallScore: 0,
    faults: [{
      id: uuid(),
      name: 'Insufficient Data',
      severity: 'Minor',
      phase: 'address',
      description: 'Not enough frames captured for analysis',
      correction: 'Try recording a longer video with better lighting',
    }],
    strengths: [],
    recommendations: [],
    tempo: { backswingDuration: 0, downswingDuration: 0, totalDuration: 0, ratio: 0 },
  };
}
