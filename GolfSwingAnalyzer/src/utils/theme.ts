/**
 * App-wide color theme and style constants
 */

export const Colors = {
  primary: '#2E9B4E',
  primaryDark: '#1a6b2e',
  primaryLight: '#4CC66D',

  background: '#000000',
  surface: '#1C1C1E',
  surfaceLight: '#2C2C2E',
  card: '#1C1C1E',

  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  accent: '#2E9B4E',

  // Score colors
  scoreExcellent: '#34C759',
  scoreGood: '#FFD60A',
  scoreFair: '#FF9F0A',
  scorePoor: '#FF453A',

  // Severity
  severityMinor: '#FFD60A',
  severityModerate: '#FF9F0A',
  severityMajor: '#FF453A',

  // UI elements
  recording: '#FF453A',
  white: '#FFFFFF',
  black: '#000000',
  border: '#38383A',
  overlay: 'rgba(0,0,0,0.6)',

  // Pose skeleton
  poseJoint: '#34C759',
  poseBone: '#30D158',
};

export function scoreColor(score: number): string {
  if (score >= 80) return Colors.scoreExcellent;
  if (score >= 60) return Colors.scoreGood;
  if (score >= 40) return Colors.scoreFair;
  return Colors.scorePoor;
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'Minor': return Colors.severityMinor;
    case 'Moderate': return Colors.severityModerate;
    case 'Major': return Colors.severityMajor;
    default: return Colors.textSecondary;
  }
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner': return Colors.scoreExcellent;
    case 'Intermediate': return Colors.scoreFair;
    case 'Advanced': return Colors.scorePoor;
    default: return Colors.textSecondary;
  }
}
