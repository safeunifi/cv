/**
 * Golf-specific theme colors adapted for Greenfit's light theme.
 * Used by the swing analysis screens.
 */

export const GolfColors = {
  primary: '#4A7C59',
  primaryLight: '#6AAE72',

  background: '#FAFAF5',
  surface: '#FAF8F5',
  surfaceLight: '#F0EBE3',
  card: '#FAF8F5',

  text: '#1A1814',
  textSecondary: '#9B917F',
  textTertiary: '#B8B0A1',

  scoreExcellent: '#17B85E',
  scoreGood: '#D4A017',
  scoreFair: '#FF9F0A',
  scorePoor: '#C0392B',

  severityMinor: '#D4A017',
  severityModerate: '#FF9F0A',
  severityMajor: '#C0392B',

  recording: '#C0392B',
  white: '#FFFFFF',
  black: '#000000',
  border: '#E5DDD1',
};

export function scoreColor(score: number): string {
  if (score >= 80) return GolfColors.scoreExcellent;
  if (score >= 60) return GolfColors.scoreGood;
  if (score >= 40) return GolfColors.scoreFair;
  return GolfColors.scorePoor;
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'Minor': return GolfColors.severityMinor;
    case 'Moderate': return GolfColors.severityModerate;
    case 'Major': return GolfColors.severityMajor;
    default: return GolfColors.textSecondary;
  }
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner': return GolfColors.scoreExcellent;
    case 'Intermediate': return GolfColors.scoreFair;
    case 'Advanced': return GolfColors.scorePoor;
    default: return GolfColors.textSecondary;
  }
}
