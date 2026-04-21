/**
 * GreenFit Workout Plan Generator
 *
 * Generates personalized workout plans based on:
 * - User's equipment tier (filters exercises they can do)
 * - Training days per week (determines split type)
 * - Fitness goals (adjusts exercise selection emphasis)
 * - Injury areas (excludes contraindicated exercises)
 * - Age (40+ modifications: more warmup, higher reps, more rest, joint-friendly preference)
 * - Golf experience (includes golf-specific TPI exercises)
 */

import type { Exercise, ExerciseCategory } from '@/types/fitness';

// ─── Types ───────────────────────────────────────────────────────────────

export interface UserProfile {
  equipmentTier: string;
  trainingDaysPerWeek: number;
  fitnessGoals: string[];
  injuryAreas: string[];
  dateOfBirth: string | null;
  golfExperience: string | null;
}

export interface GeneratedPlanDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  exercises: GeneratedPlanExercise[];
  estimatedDurationMinutes: number;
}

export interface GeneratedPlanExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  notes: string | null;
  sortOrder: number;
}

export interface GeneratedPlan {
  title: string;
  description: string;
  daysPerWeek: number;
  durationWeeks: number;
  planType: string;
  equipmentTier: string;
  fitnessGoals: string[];
  days: GeneratedPlanDay[];
}

// ─── Constants ───────────────────────────────────────────────────────────

const EQUIPMENT_TIER_HIERARCHY: Record<string, number> = {
  none: 0,
  minimal: 1,
  home_gym: 2,
  full_gym: 3,
};

// Day templates based on training frequency
interface DayTemplate {
  dayName: string;
  focus: string;
  slots: ExerciseSlot[];
}

interface ExerciseSlot {
  category: ExerciseCategory | 'any';
  preferGolf?: boolean;
  preferMovementPattern?: string;
  preferJointFriendly?: boolean;
  fallbackCategory?: ExerciseCategory;
}

// ─── Split Templates ─────────────────────────────────────────────────────

function getSplitTemplates(days: number, includeGolf: boolean): DayTemplate[] {
  // Always add golf mobility slots when user plays golf
  const golfWarmup: ExerciseSlot[] = includeGolf
    ? [
        { category: 'golf_specific', preferMovementPattern: 'rotation' },
        { category: 'golf_specific', preferMovementPattern: 'anti_rotation', fallbackCategory: 'mobility' },
      ]
    : [
        { category: 'mobility' },
      ];

  switch (days) {
    case 1:
    case 2:
      // Full body each session
      return Array.from({ length: days }, (_, i) => ({
        dayName: `Full Body ${String.fromCharCode(65 + i)}`,
        focus: 'Full Body',
        slots: [
          ...golfWarmup,
          { category: 'strength', preferMovementPattern: 'squat' },
          { category: 'strength', preferMovementPattern: 'horizontal_push' },
          { category: 'strength', preferMovementPattern: 'horizontal_pull' },
          { category: 'strength', preferMovementPattern: 'hip_hinge' },
          { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
          { category: 'flexibility' },
        ],
      }));

    case 3:
      return [
        {
          dayName: 'Full Body A',
          focus: 'Full Body - Push Emphasis',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Full Body B',
          focus: 'Full Body - Pull Emphasis',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'vertical_pull', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'balance', fallbackCategory: 'flexibility' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Golf Mobility',
          focus: 'Golf Mobility & Core',
          slots: includeGolf
            ? [
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ]
            : [
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ],
        },
      ];

    case 4:
      return [
        {
          dayName: 'Upper Body',
          focus: 'Upper Body Strength',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'vertical_pull', fallbackCategory: 'strength' },
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Lower Body',
          focus: 'Lower Body Strength',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'carry', fallbackCategory: 'strength' },
            { category: 'balance', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Golf Mobility',
          focus: 'Golf Mobility & Stability',
          slots: includeGolf
            ? [
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ]
            : [
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ],
        },
        {
          dayName: 'Full Body',
          focus: 'Full Body Power & Conditioning',
          slots: [
            ...golfWarmup,
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'cardio', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
      ];

    case 5:
      return [
        {
          dayName: 'Push',
          focus: 'Push (Chest, Shoulders, Triceps)',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength' },
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Pull',
          focus: 'Pull (Back, Biceps)',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength', preferMovementPattern: 'vertical_pull', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength' },
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Legs',
          focus: 'Legs & Glutes',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'carry', fallbackCategory: 'strength' },
            { category: 'balance', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Golf Mobility',
          focus: 'Golf Mobility & Core Stability',
          slots: includeGolf
            ? [
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
              ]
            : [
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ],
        },
        {
          dayName: 'Full Body',
          focus: 'Full Body Conditioning',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'cardio', fallbackCategory: 'power' },
            { category: 'balance', fallbackCategory: 'flexibility' },
            { category: 'flexibility' },
          ],
        },
      ];

    case 6:
    case 7:
    default:
      return [
        {
          dayName: 'Push',
          focus: 'Push (Chest, Shoulders, Triceps)',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Pull',
          focus: 'Pull (Back, Biceps)',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength', preferMovementPattern: 'vertical_pull', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Legs',
          focus: 'Legs & Glutes',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'power', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Upper Body',
          focus: 'Upper Body Volume',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'horizontal_push' },
            { category: 'strength', preferMovementPattern: 'horizontal_pull' },
            { category: 'strength', preferMovementPattern: 'vertical_push', fallbackCategory: 'strength' },
            { category: 'strength', preferMovementPattern: 'vertical_pull', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Lower Body',
          focus: 'Lower Body Volume',
          slots: [
            ...golfWarmup,
            { category: 'strength', preferMovementPattern: 'hip_hinge' },
            { category: 'strength', preferMovementPattern: 'squat' },
            { category: 'strength', preferMovementPattern: 'carry', fallbackCategory: 'strength' },
            { category: 'balance', fallbackCategory: 'strength' },
            { category: 'flexibility' },
          ],
        },
        {
          dayName: 'Golf Mobility',
          focus: 'Golf Mobility & Recovery',
          slots: includeGolf
            ? [
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'golf_specific' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ]
            : [
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'mobility' },
                { category: 'flexibility' },
                { category: 'flexibility' },
                { category: 'flexibility' },
                { category: 'balance', fallbackCategory: 'flexibility' },
              ],
        },
      ];
  }
}

// ─── Helper Functions ────────────────────────────────────────────────────

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function canUseEquipment(exerciseTier: string, userTier: string): boolean {
  const exerciseLevel = EQUIPMENT_TIER_HIERARCHY[exerciseTier] ?? 0;
  const userLevel = EQUIPMENT_TIER_HIERARCHY[userTier] ?? 0;
  return exerciseLevel <= userLevel;
}

function hasContraindication(exercise: Exercise, injuryAreas: string[]): boolean {
  if (injuryAreas.length === 0) return false;
  return exercise.contraindicatedAreas.some((area) => injuryAreas.includes(area));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get sets/reps/rest prescription based on exercise category and age
 */
function getPrescription(
  category: ExerciseCategory,
  isOver40: boolean
): { sets: number; repRange: string; restSeconds: number } {
  const base = {
    strength: { sets: 3, repRange: '8-12', restSeconds: 90 },
    power: { sets: 3, repRange: '5-8', restSeconds: 120 },
    mobility: { sets: 2, repRange: '10-15', restSeconds: 45 },
    golf_specific: { sets: 2, repRange: '10-12', restSeconds: 60 },
    cardio: { sets: 1, repRange: '30-60 sec', restSeconds: 60 },
    flexibility: { sets: 2, repRange: '30 sec hold', restSeconds: 30 },
    balance: { sets: 2, repRange: '30 sec hold', restSeconds: 30 },
  };

  const prescription = base[category] || base.strength;

  if (isOver40) {
    return {
      sets: Math.max(2, prescription.sets - 1),
      repRange: category === 'strength' ? '10-15' : prescription.repRange,
      restSeconds: prescription.restSeconds + 15,
    };
  }

  return prescription;
}

// ─── Main Generator ──────────────────────────────────────────────────────

export function generateWorkoutPlan(
  exercises: Exercise[],
  profile: UserProfile
): GeneratedPlan {
  const {
    equipmentTier,
    trainingDaysPerWeek,
    fitnessGoals,
    injuryAreas,
    dateOfBirth,
    golfExperience,
  } = profile;

  // Determine age
  const age = dateOfBirth ? calculateAge(dateOfBirth) : 35;
  const isOver40 = age >= 40;
  const includeGolf = golfExperience !== null && golfExperience !== 'none';

  // Filter exercises by equipment tier and injury areas
  const availableExercises = exercises.filter((ex) => {
    if (!canUseEquipment(ex.equipmentTier, equipmentTier)) return false;
    if (hasContraindication(ex, injuryAreas)) return false;
    // For 40+ users, prefer joint-friendly exercises but don't exclude all non-joint-friendly
    return true;
  });

  // Group exercises by category
  const byCategory: Record<string, Exercise[]> = {};
  for (const ex of availableExercises) {
    if (!byCategory[ex.category]) byCategory[ex.category] = [];
    byCategory[ex.category].push(ex);
  }

  // Get the split template
  const clampedDays = Math.max(1, Math.min(7, trainingDaysPerWeek));
  const templates = getSplitTemplates(clampedDays, includeGolf);

  // Track used exercise IDs across all days for variety
  const usedExerciseIds = new Set<string>();

  // Generate each day
  const days: GeneratedPlanDay[] = templates.map((template, dayIndex) => {
    const dayExercises: GeneratedPlanExercise[] = [];
    // Track used within this day to avoid duplicates
    const usedInDay = new Set<string>();

    template.slots.forEach((slot, slotIndex) => {
      const exercise = pickExercise(
        slot,
        byCategory,
        usedExerciseIds,
        usedInDay,
        isOver40,
        includeGolf
      );

      if (exercise) {
        usedExerciseIds.add(exercise.id);
        usedInDay.add(exercise.id);

        const prescription = getPrescription(exercise.category as ExerciseCategory, isOver40);

        dayExercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: prescription.sets,
          repRange: prescription.repRange,
          restSeconds: prescription.restSeconds,
          notes: exercise.golfBenefit && includeGolf
            ? exercise.golfBenefit.substring(0, 80) + (exercise.golfBenefit.length > 80 ? '...' : '')
            : null,
          sortOrder: slotIndex,
        });
      }
    });

    // Estimate duration: sum of (sets * ~45sec per set + rest between sets)
    const estimatedMinutes = dayExercises.reduce((total, ex) => {
      const setTime = ex.sets * 0.75; // ~45 sec per set
      const restTime = (ex.sets - 1) * (ex.restSeconds / 60);
      return total + setTime + restTime;
    }, 0);

    return {
      dayNumber: dayIndex + 1,
      dayName: template.dayName,
      focus: template.focus,
      exercises: dayExercises,
      estimatedDurationMinutes: Math.round(Math.max(20, estimatedMinutes)),
    };
  });

  // Generate plan title and description
  const goalLabels: Record<string, string> = {
    lose_fat: 'Fat Loss',
    build_muscle: 'Muscle Building',
    improve_mobility: 'Mobility',
    golf_performance: 'Golf Performance',
    general_health: 'General Health',
  };

  const primaryGoal = fitnessGoals.length > 0
    ? goalLabels[fitnessGoals[0]] || 'Fitness'
    : 'Fitness';

  const planType = clampedDays <= 2
    ? 'full_body'
    : clampedDays <= 3
    ? 'full_body_split'
    : clampedDays <= 4
    ? 'upper_lower'
    : 'push_pull_legs';

  const title = `${clampedDays}-Day ${primaryGoal} Plan`;
  const description = `A ${clampedDays}-day per week program designed for ${primaryGoal.toLowerCase()}${
    includeGolf ? ' with golf-specific mobility work' : ''
  }${isOver40 ? ', optimized for 40+ athletes' : ''}.`;

  return {
    title,
    description,
    daysPerWeek: clampedDays,
    durationWeeks: 4,
    planType,
    equipmentTier,
    fitnessGoals,
    days,
  };
}

// ─── Exercise Picker ─────────────────────────────────────────────────────

function pickExercise(
  slot: ExerciseSlot,
  byCategory: Record<string, Exercise[]>,
  usedGlobal: Set<string>,
  usedInDay: Set<string>,
  isOver40: boolean,
  includeGolf: boolean
): Exercise | null {
  // Get candidate pool from category
  let candidates = byCategory[slot.category] || [];

  // Try fallback category if primary is empty
  if (candidates.length === 0 && slot.fallbackCategory) {
    candidates = byCategory[slot.fallbackCategory] || [];
  }

  // Still empty? Try 'any' from all categories
  if (candidates.length === 0) {
    candidates = Object.values(byCategory).flat();
  }

  if (candidates.length === 0) return null;

  // Filter out already used in this day
  let filtered = candidates.filter((ex) => !usedInDay.has(ex.id));

  // Prefer not used globally (for variety across days)
  const unused = filtered.filter((ex) => !usedGlobal.has(ex.id));
  if (unused.length > 0) filtered = unused;

  // Apply movement pattern preference
  if (slot.preferMovementPattern) {
    const patternMatch = filtered.filter(
      (ex) => ex.movementPattern === slot.preferMovementPattern
    );
    if (patternMatch.length > 0) filtered = patternMatch;
  }

  // Prefer golf-specific if requested
  if (slot.preferGolf) {
    const golfMatch = filtered.filter((ex) => ex.isGolfSpecific);
    if (golfMatch.length > 0) filtered = golfMatch;
  }

  // For 40+ users, prefer joint-friendly exercises
  if (isOver40) {
    const jointFriendly = filtered.filter((ex) => ex.isJointFriendly);
    if (jointFriendly.length > 0) {
      // 70% chance to pick joint-friendly when available
      if (Math.random() < 0.7) {
        filtered = jointFriendly;
      }
    }
  }

  // Shuffle and pick the first one
  const shuffled = shuffleArray(filtered);
  return shuffled[0] || null;
}
