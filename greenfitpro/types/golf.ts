// ============================================================
// Camera & Recording
// ============================================================

export type CameraAngle = 'dtl' | 'faceOn';

export const CameraAngleLabels: Record<CameraAngle, string> = {
  dtl: 'Down the Line',
  faceOn: 'Face On',
};

export const CameraAngleAbbreviations: Record<CameraAngle, string> = {
  dtl: 'DTL',
  faceOn: 'FO',
};

export const CameraAngleInstructions: Record<CameraAngle, string> = {
  dtl: 'Place your phone directly behind you, aligned with your target line. Position at hand height, about 10 feet back.',
  faceOn: 'Place your phone facing you, perpendicular to your target line. Position at waist height, about 10 feet away.',
};

export type ClubType =
  | 'Driver' | '3 Wood' | '5 Wood' | 'Hybrid'
  | '4 Iron' | '5 Iron' | '6 Iron' | '7 Iron' | '8 Iron' | '9 Iron'
  | 'PW' | 'GW' | 'SW' | 'LW' | 'Putter';

export const ALL_CLUBS: ClubType[] = [
  'Driver', '3 Wood', '5 Wood', 'Hybrid',
  '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron',
  'PW', 'GW', 'SW', 'LW', 'Putter',
];

// ============================================================
// Pose Detection
// ============================================================

export interface JointPosition {
  x: number;
  y: number;
  confidence: number;
}

export type JointName =
  | 'nose' | 'neck'
  | 'leftShoulder' | 'rightShoulder'
  | 'leftElbow' | 'rightElbow'
  | 'leftWrist' | 'rightWrist'
  | 'root'
  | 'leftHip' | 'rightHip'
  | 'leftKnee' | 'rightKnee'
  | 'leftAnkle' | 'rightAnkle';

export interface PoseFrame {
  timestamp: number;
  joints: Partial<Record<JointName, JointPosition>>;
}

// ============================================================
// Swing Analysis
// ============================================================

export type SwingPhase =
  | 'address' | 'takeaway' | 'backswing' | 'topOfBackswing'
  | 'downswing' | 'impact' | 'followThrough' | 'finish';

export const SWING_PHASES: SwingPhase[] = [
  'address', 'takeaway', 'backswing', 'topOfBackswing',
  'downswing', 'impact', 'followThrough', 'finish',
];

export const SwingPhaseLabels: Record<SwingPhase, string> = {
  address: 'Address',
  takeaway: 'Takeaway',
  backswing: 'Backswing',
  topOfBackswing: 'Top of Backswing',
  downswing: 'Downswing',
  impact: 'Impact',
  followThrough: 'Follow Through',
  finish: 'Finish',
};

export const SwingPhasePercentages: Record<SwingPhase, [number, number]> = {
  address: [0.0, 0.10],
  takeaway: [0.10, 0.25],
  backswing: [0.25, 0.40],
  topOfBackswing: [0.40, 0.50],
  downswing: [0.50, 0.70],
  impact: [0.70, 0.75],
  followThrough: [0.75, 0.90],
  finish: [0.90, 1.0],
};

export interface PhaseAnalysis {
  score: number;
  keyAngles: Record<string, number>;
  observations: string[];
  frameTimestamp: number;
}

export type FaultSeverity = 'Minor' | 'Moderate' | 'Major';

export interface SwingFault {
  id: string;
  name: string;
  severity: FaultSeverity;
  phase: SwingPhase;
  description: string;
  correction: string;
}

export interface SwingTempo {
  backswingDuration: number;
  downswingDuration: number;
  totalDuration: number;
  ratio: number;
}

export interface DrillRecommendation {
  id: string;
  drillId: string;
  priority: number;
  reason: string;
}

export interface SwingAnalysis {
  phases: Partial<Record<SwingPhase, PhaseAnalysis>>;
  overallScore: number;
  faults: SwingFault[];
  strengths: string[];
  recommendations: DrillRecommendation[];
  tempo: SwingTempo;
}

// ============================================================
// Session / History
// ============================================================

export interface SwingSession {
  id: string;
  date: string;
  cameraAngle: CameraAngle;
  videoUri: string;
  durationSeconds: number;
  clubType: ClubType;
  analysis: SwingAnalysis | null;
  notes: string;
}

// ============================================================
// Drills
// ============================================================

export type DrillCategory =
  | 'Posture' | 'Rotation' | 'Balance' | 'Power'
  | 'Connection' | 'Impact' | 'Stability' | 'Flexibility'
  | 'Fundamentals' | 'Tempo';

export const ALL_DRILL_CATEGORIES: DrillCategory[] = [
  'Posture', 'Rotation', 'Balance', 'Power',
  'Connection', 'Impact', 'Stability', 'Flexibility',
  'Fundamentals', 'Tempo',
];

export type DrillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Drill {
  id: string;
  name: string;
  category: DrillCategory;
  targetFaults: string[];
  difficulty: DrillDifficulty;
  equipment: string[];
  description: string;
  steps: string[];
  reps: string;
  keyFocus: string;
}

// ============================================================
// Swing Angles
// ============================================================

export interface SwingAngles {
  spineAngle?: number;
  kneeFlex?: number;
  hipBend?: number;
  shoulderTurn?: number;
  hipTurn?: number;
  xFactor?: number;
  leftArmAngle?: number;
  wristHinge?: number;
  hipSlide?: number;
  shaftLean?: number;
  headMovement?: number;
  spineAngleRetention?: number;
  extensionAngle?: number;
  finishBalance?: number;
}

export function anglesToRecord(angles: SwingAngles): Record<string, number> {
  const result: Record<string, number> = {};
  if (angles.spineAngle != null) result['Spine Angle'] = angles.spineAngle;
  if (angles.kneeFlex != null) result['Knee Flex'] = angles.kneeFlex;
  if (angles.hipBend != null) result['Hip Bend'] = angles.hipBend;
  if (angles.shoulderTurn != null) result['Shoulder Turn'] = angles.shoulderTurn;
  if (angles.hipTurn != null) result['Hip Turn'] = angles.hipTurn;
  if (angles.xFactor != null) result['X-Factor'] = angles.xFactor;
  if (angles.leftArmAngle != null) result['Lead Arm'] = angles.leftArmAngle;
  if (angles.wristHinge != null) result['Wrist Hinge'] = angles.wristHinge;
  if (angles.hipSlide != null) result['Hip Slide'] = angles.hipSlide;
  if (angles.shaftLean != null) result['Shaft Lean'] = angles.shaftLean;
  if (angles.headMovement != null) result['Head Movement'] = angles.headMovement;
  if (angles.spineAngleRetention != null) result['Spine Retention'] = angles.spineAngleRetention;
  if (angles.extensionAngle != null) result['Extension'] = angles.extensionAngle;
  if (angles.finishBalance != null) result['Finish Balance'] = angles.finishBalance;
  return result;
}
