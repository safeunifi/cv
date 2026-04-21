import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Gender,
  ActivityLevel,
  EquipmentTier,
  GolfExperience,
  FitnessGoal,
  InjuryArea,
  DietaryPreference,
  MacroTargets,
} from '@/types/onboarding';
import { calculateMacros } from '@/lib/nutrition/calculate-macros';
import { calculateAge } from '@/lib/utils/date';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;

  // Step 1
  fullName: string;

  // Step 2
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  gender: Gender;

  // Step 3
  fitnessGoals: FitnessGoal[];

  // Step 4
  activityLevel: ActivityLevel;

  // Step 5
  equipmentTier: EquipmentTier;

  // Step 6
  golfExperience: GolfExperience;
  golfHandicap: number | null;

  // Step 7
  injuryAreas: InjuryArea[];

  // Step 8
  trainingDaysPerWeek: number;

  // Step 9
  dietaryPreferences: DietaryPreference[];

  // Calculated (Step 10)
  macroTargets: MacroTargets | null;

  // Units preference
  useImperial: boolean;

  // Actions
  setField: <K extends keyof OnboardingState>(field: K, value: OnboardingState[K]) => void;
  toggleGoal: (goal: FitnessGoal) => void;
  toggleInjury: (area: InjuryArea) => void;
  toggleDiet: (pref: DietaryPreference) => void;
  nextStep: () => void;
  prevStep: () => void;
  computeMacros: () => MacroTargets;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  totalSteps: 10,
  fullName: '',
  dateOfBirth: '',
  heightCm: 175,
  weightKg: 80,
  gender: 'male' as Gender,
  fitnessGoals: [] as FitnessGoal[],
  activityLevel: 'moderately_active' as ActivityLevel,
  equipmentTier: 'none' as EquipmentTier,
  golfExperience: 'beginner' as GolfExperience,
  golfHandicap: null as number | null,
  injuryAreas: [] as InjuryArea[],
  trainingDaysPerWeek: 3,
  dietaryPreferences: ['gluten_free', 'dairy_free'] as DietaryPreference[],
  macroTargets: null as MacroTargets | null,
  useImperial: true,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setField: (field, value) => set({ [field]: value }),

      toggleGoal: (goal) => {
        const current = get().fitnessGoals;
        const updated = current.includes(goal)
          ? current.filter((g) => g !== goal)
          : [...current, goal];
        set({ fitnessGoals: updated });
      },

      toggleInjury: (area) => {
        const current = get().injuryAreas;
        const updated = current.includes(area)
          ? current.filter((a) => a !== area)
          : [...current, area];
        set({ injuryAreas: updated });
      },

      toggleDiet: (pref) => {
        const current = get().dietaryPreferences;
        const updated = current.includes(pref)
          ? current.filter((p) => p !== pref)
          : [...current, pref];
        set({ dietaryPreferences: updated });
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      computeMacros: () => {
        const state = get();
        const age = state.dateOfBirth ? calculateAge(state.dateOfBirth) : 30;
        const targets = calculateMacros({
          weightKg: state.weightKg,
          heightCm: state.heightCm,
          age,
          gender: state.gender,
          activityLevel: state.activityLevel,
          fitnessGoals: state.fitnessGoals,
        });
        set({ macroTargets: targets });
        return targets;
      },

      reset: () => set(initialState),
    }),
    {
      name: 'greenfit-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
