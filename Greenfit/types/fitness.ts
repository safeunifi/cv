export type ExerciseCategory = 'strength' | 'mobility' | 'power' | 'cardio' | 'flexibility' | 'balance' | 'golf_specific';
export type MovementPattern = 'horizontal_push' | 'horizontal_pull' | 'vertical_push' | 'vertical_pull' | 'hip_hinge' | 'squat' | 'carry' | 'rotation' | 'anti_rotation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SetType = 'warmup' | 'working' | 'dropset' | 'amrap' | 'timed';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  subcategory: string | null;
  muscleGroups: string[];
  movementPattern: MovementPattern | null;
  equipmentNeeded: string[];
  equipmentTier: string;
  difficulty: Difficulty;
  isGolfSpecific: boolean;
  golfBenefit: string | null;
  tpiCategory: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  isJointFriendly: boolean;
  contraindicatedAreas: string[];
  isSystemExercise: boolean;
  createdAt: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  daysPerWeek: number;
  durationWeeks: number;
  planType: string;
  equipmentTier: string;
  fitnessGoals: string[];
  isActive: boolean;
  startDate: string | null;
  createdAt: string;
  days?: WorkoutPlanDay[];
}

export interface WorkoutPlanDay {
  id: string;
  workoutPlanId: string;
  dayNumber: number;
  dayName: string;
  focus: string | null;
  estimatedDurationMinutes: number | null;
  sortOrder: number;
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: string;
  workoutPlanDayId: string;
  exerciseId: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  tempo: string | null;
  rpeTarget: number | null;
  notes: string | null;
  supersetGroup: string | null;
  sortOrder: number;
  exercise?: Exercise;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutPlanDayId: string | null;
  workoutDate: string;
  title: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMinutes: number | null;
  overallRpe: number | null;
  notes: string | null;
  createdAt: string;
  sets?: WorkoutLogSet[];
}

export interface WorkoutLogSet {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  setNumber: number;
  setType: SetType;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
}
