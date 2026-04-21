import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  units: 'imperial' | 'metric';
  theme: 'light' | 'dark' | 'system';
  waterGoalMl: number;
  mealReminders: boolean;
  workoutReminders: boolean;
  waterReminders: boolean;

  setUnits: (units: 'imperial' | 'metric') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setWaterGoalMl: (ml: number) => void;
  setMealReminders: (enabled: boolean) => void;
  setWorkoutReminders: (enabled: boolean) => void;
  setWaterReminders: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      units: 'imperial',
      theme: 'light',
      waterGoalMl: 1893, // ~64 oz
      mealReminders: false,
      workoutReminders: false,
      waterReminders: false,

      setUnits: (units) => set({ units }),
      setTheme: (theme) => set({ theme }),
      setWaterGoalMl: (waterGoalMl) => set({ waterGoalMl }),
      setMealReminders: (mealReminders) => set({ mealReminders }),
      setWorkoutReminders: (workoutReminders) => set({ workoutReminders }),
      setWaterReminders: (waterReminders) => set({ waterReminders }),
    }),
    {
      name: 'greenfit-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
