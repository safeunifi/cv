import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { WorkoutPlan, WorkoutLog, WorkoutLogSet, Exercise } from '@/types/fitness';

interface ActiveWorkoutState {
  workoutLogId: string | null;
  dayName: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    prescribedSets: number;
    prescribedReps: string;
    restSeconds: number;
    completedSets: WorkoutLogSet[];
  }>;
  startedAt: string | null;
  currentExerciseIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
}

interface FitnessState {
  // Workout plans
  activePlan: WorkoutPlan | null;

  // Active workout
  activeWorkout: ActiveWorkoutState | null;

  // Exercise library
  exercises: Exercise[];
  isLoadingExercises: boolean;
  exercisesLoaded: boolean;
  exerciseFilter: {
    category: string | null;
    equipmentTier: string | null;
    searchQuery: string;
  };

  // Actions
  fetchExercises: () => Promise<void>;
  setActivePlan: (plan: WorkoutPlan | null) => void;
  startWorkout: (workout: ActiveWorkoutState) => void;
  logSet: (exerciseIndex: number, set: WorkoutLogSet) => void;
  finishWorkout: () => void;
  setExercises: (exercises: Exercise[]) => void;
  setExerciseFilter: (filter: Partial<FitnessState['exerciseFilter']>) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setResting: (resting: boolean, timeRemaining: number) => void;
}

export const useFitnessStore = create<FitnessState>((set, get) => ({
  activePlan: null,
  activeWorkout: null,
  exercises: [],
  isLoadingExercises: false,
  exercisesLoaded: false,
  exerciseFilter: {
    category: null,
    equipmentTier: null,
    searchQuery: '',
  },

  fetchExercises: async () => {
    const { exercisesLoaded, isLoadingExercises } = get();
    if (exercisesLoaded || isLoadingExercises) return;

    set({ isLoadingExercises: true });

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_system_exercise', true)
        .order('category')
        .order('name');

      if (error) {
        console.error('Error fetching exercises:', error);
        set({ isLoadingExercises: false });
        return;
      }

      if (data) {
        const mapped: Exercise[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          subcategory: row.subcategory,
          muscleGroups: row.muscle_groups ?? [],
          movementPattern: row.movement_pattern,
          equipmentNeeded: row.equipment_needed ?? [],
          equipmentTier: row.equipment_tier,
          difficulty: row.difficulty,
          isGolfSpecific: row.is_golf_specific ?? false,
          golfBenefit: row.golf_benefit,
          tpiCategory: row.tpi_category,
          videoUrl: row.video_url,
          thumbnailUrl: row.thumbnail_url,
          isJointFriendly: row.is_joint_friendly ?? false,
          contraindicatedAreas: row.contraindicated_areas ?? [],
          isSystemExercise: row.is_system_exercise ?? true,
          createdAt: row.created_at,
        }));

        set({ exercises: mapped, exercisesLoaded: true });
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      set({ isLoadingExercises: false });
    }
  },

  setActivePlan: (plan) => set({ activePlan: plan }),

  startWorkout: (workout) => set({ activeWorkout: workout }),

  logSet: (exerciseIndex, setData) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const exercises = [...workout.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      completedSets: [...exercises[exerciseIndex].completedSets, setData],
    };
    set({ activeWorkout: { ...workout, exercises } });
  },

  finishWorkout: () => set({ activeWorkout: null }),

  setExercises: (exercises) => set({ exercises }),

  setExerciseFilter: (filter) =>
    set({ exerciseFilter: { ...get().exerciseFilter, ...filter } }),

  setCurrentExerciseIndex: (index) => {
    const workout = get().activeWorkout;
    if (!workout) return;
    set({ activeWorkout: { ...workout, currentExerciseIndex: index } });
  },

  setResting: (isResting, restTimeRemaining) => {
    const workout = get().activeWorkout;
    if (!workout) return;
    set({ activeWorkout: { ...workout, isResting, restTimeRemaining } });
  },
}));
