/**
 * Maps swing analysis faults to targeted exercises from the Greenfit exercise DB.
 *
 * Each fault has physical root causes (tight hips, weak glutes, poor rotation, etc.).
 * This service maps those to exercise categories, movement patterns, and muscle groups
 * so the app can generate a workout plan that directly addresses swing issues.
 */

import type { SwingFault, SwingAnalysis } from '@/types/golf';
import type { Exercise } from '@/types/fitness';

export interface SwingWorkoutExercise {
  exercise: Exercise;
  sets: number;
  repRange: string;
  restSeconds: number;
  reason: string;
}

export interface SwingWorkoutPlan {
  title: string;
  description: string;
  warmup: SwingWorkoutExercise[];
  main: SwingWorkoutExercise[];
  cooldown: SwingWorkoutExercise[];
  estimatedMinutes: number;
}

interface FaultExerciseMapping {
  /** Exercise categories to prioritize */
  categories: string[];
  /** Preferred movement patterns */
  movementPatterns: string[];
  /** Target muscle groups */
  muscleGroups: string[];
  /** Prefer golf-specific exercises */
  preferGolf: boolean;
  /** Why these exercises help */
  rationale: string;
}

const FAULT_EXERCISE_MAP: Record<string, FaultExerciseMapping> = {
  'Early Extension': {
    categories: ['mobility', 'golf_specific', 'strength'],
    movementPatterns: ['hip_hinge', 'squat', 'anti_rotation'],
    muscleGroups: ['glutes', 'core', 'hip flexors'],
    preferGolf: true,
    rationale: 'Strengthen glutes and core to maintain posture through impact',
  },
  'Hip Sway': {
    categories: ['mobility', 'golf_specific', 'balance'],
    movementPatterns: ['anti_rotation', 'squat'],
    muscleGroups: ['hip abductors', 'glutes', 'obliques'],
    preferGolf: true,
    rationale: 'Improve lateral hip stability and rotational control',
  },
  'Casting / Early Release': {
    categories: ['golf_specific', 'strength', 'power'],
    movementPatterns: ['rotation', 'horizontal_pull'],
    muscleGroups: ['forearms', 'lats', 'core'],
    preferGolf: true,
    rationale: 'Build lag retention through wrist strength and sequencing drills',
  },
  'Restricted Turn': {
    categories: ['mobility', 'golf_specific', 'flexibility'],
    movementPatterns: ['rotation', 'anti_rotation'],
    muscleGroups: ['thoracic spine', 'obliques', 'hip flexors'],
    preferGolf: true,
    rationale: 'Increase thoracic rotation and hip mobility for a fuller turn',
  },
  'Chicken Wing': {
    categories: ['golf_specific', 'strength', 'mobility'],
    movementPatterns: ['horizontal_pull', 'horizontal_push'],
    muscleGroups: ['lats', 'rear deltoids', 'triceps'],
    preferGolf: true,
    rationale: 'Improve arm extension and connection through the swing',
  },
  'Head Movement': {
    categories: ['golf_specific', 'balance', 'strength'],
    movementPatterns: ['anti_rotation', 'rotation'],
    muscleGroups: ['core', 'neck', 'glutes'],
    preferGolf: true,
    rationale: 'Strengthen core stability to maintain a steady head position',
  },
};

/** Default mapping when fault name doesn't match */
const DEFAULT_MAPPING: FaultExerciseMapping = {
  categories: ['golf_specific', 'mobility', 'flexibility'],
  movementPatterns: ['rotation', 'anti_rotation'],
  muscleGroups: ['core', 'glutes'],
  preferGolf: true,
  rationale: 'General golf-specific conditioning for swing improvement',
};

/**
 * Generate a targeted workout plan based on swing analysis faults.
 */
export function generateSwingWorkout(
  analysis: SwingAnalysis,
  exercises: Exercise[],
  equipmentTier: string,
  injuryAreas: string[] = []
): SwingWorkoutPlan {
  const TIER_LEVEL: Record<string, number> = { none: 0, minimal: 1, home_gym: 2, full_gym: 3 };
  const userLevel = TIER_LEVEL[equipmentTier] ?? 0;

  // Filter available exercises
  const available = exercises.filter((ex) => {
    const exLevel = TIER_LEVEL[ex.equipmentTier] ?? 0;
    if (exLevel > userLevel) return false;
    if (injuryAreas.length > 0 && ex.contraindicatedAreas.some((a) => injuryAreas.includes(a))) return false;
    return true;
  });

  const used = new Set<string>();

  function pickExercises(
    mapping: FaultExerciseMapping,
    count: number,
    faultName: string
  ): SwingWorkoutExercise[] {
    const results: SwingWorkoutExercise[] = [];

    // Score each exercise by relevance to this fault
    const scored = available
      .filter((ex) => !used.has(ex.id))
      .map((ex) => {
        let score = 0;
        if (mapping.categories.includes(ex.category)) score += 3;
        if (ex.movementPattern && mapping.movementPatterns.includes(ex.movementPattern)) score += 4;
        if (mapping.muscleGroups.some((mg) => ex.muscleGroups.some((emg) => emg.toLowerCase().includes(mg.toLowerCase())))) score += 2;
        if (mapping.preferGolf && ex.isGolfSpecific) score += 5;
        return { exercise: ex, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    for (let i = 0; i < Math.min(count, scored.length); i++) {
      const ex = scored[i].exercise;
      used.add(ex.id);

      const isStrength = ex.category === 'strength' || ex.category === 'power';
      const isMobility = ex.category === 'mobility' || ex.category === 'flexibility' || ex.category === 'balance';

      results.push({
        exercise: ex,
        sets: isStrength ? 3 : 2,
        repRange: isStrength ? '8-12' : isMobility ? '10-15 each side' : '10-12',
        restSeconds: isStrength ? 90 : 45,
        reason: `Addresses ${faultName}: ${mapping.rationale}`,
      });
    }

    return results;
  }

  // Build warmup from mobility/flexibility exercises
  const warmupMapping: FaultExerciseMapping = {
    categories: ['mobility', 'flexibility', 'golf_specific'],
    movementPatterns: ['rotation', 'hip_hinge'],
    muscleGroups: ['hip flexors', 'thoracic spine', 'hamstrings'],
    preferGolf: true,
    rationale: 'Pre-round mobility prep',
  };
  const warmup = pickExercises(warmupMapping, 3, 'Warmup');
  warmup.forEach((w) => { w.sets = 1; w.repRange = '8-10 each side'; w.restSeconds = 15; w.reason = 'Dynamic warmup for golf-specific mobility'; });

  // Build main section — pick exercises for each fault, prioritized by severity
  const sortedFaults = [...analysis.faults].sort((a, b) => {
    const order = { Major: 0, Moderate: 1, Minor: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  const main: SwingWorkoutExercise[] = [];
  const exercisesPerFault = sortedFaults.length <= 2 ? 3 : 2;

  for (const fault of sortedFaults) {
    const mapping = FAULT_EXERCISE_MAP[fault.name] || DEFAULT_MAPPING;
    const picked = pickExercises(mapping, exercisesPerFault, fault.name);
    main.push(...picked);
  }

  // If fewer than 2 faults, add general golf conditioning
  if (sortedFaults.length < 2 && main.length < 6) {
    const generalPick = pickExercises(DEFAULT_MAPPING, 6 - main.length, 'General Swing');
    main.push(...generalPick);
  }

  // Build cooldown from flexibility exercises
  const cooldownMapping: FaultExerciseMapping = {
    categories: ['flexibility', 'mobility'],
    movementPatterns: ['rotation', 'hip_hinge'],
    muscleGroups: ['hamstrings', 'hip flexors', 'thoracic spine', 'shoulders'],
    preferGolf: false,
    rationale: 'Post-workout recovery',
  };
  const cooldown = pickExercises(cooldownMapping, 3, 'Cooldown');
  cooldown.forEach((c) => { c.sets = 1; c.repRange = '30 sec hold'; c.restSeconds = 10; c.reason = 'Recovery stretch for worked muscles'; });

  // Estimate duration
  const allExercises = [...warmup, ...main, ...cooldown];
  const estimatedMinutes = allExercises.reduce((total, ex) => {
    const setTime = ex.sets * 0.75;
    const restTime = (ex.sets - 1) * (ex.restSeconds / 60);
    return total + setTime + restTime;
  }, 2); // 2min for transitions

  // Build title based on primary faults
  const primaryFaults = sortedFaults.slice(0, 2).map((f) => f.name).join(' & ');
  const title = primaryFaults
    ? `Swing Fix: ${primaryFaults}`
    : 'Golf Performance Workout';

  return {
    title,
    description: `A targeted workout addressing your swing faults with ${main.length} exercises focused on mobility, stability, and strength.`,
    warmup,
    main,
    cooldown,
    estimatedMinutes: Math.round(Math.max(15, estimatedMinutes)),
  };
}
