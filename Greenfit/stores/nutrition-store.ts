import { create } from 'zustand';
import type { FoodLogEntry, DailyNutritionSummary, USDAFoodSearchResult } from '@/types/nutrition';

interface NutritionState {
  // Daily food log
  todayEntries: FoodLogEntry[];
  dailySummary: DailyNutritionSummary | null;
  selectedDate: string; // ISO date string

  // Food search
  searchResults: USDAFoodSearchResult[];
  recentFoods: Array<{ fdcId: number; name: string; calories: number }>;
  isSearching: boolean;

  // Water
  todayWaterMl: number;

  // Actions
  setTodayEntries: (entries: FoodLogEntry[]) => void;
  addEntry: (entry: FoodLogEntry) => void;
  removeEntry: (id: string) => void;
  setDailySummary: (summary: DailyNutritionSummary | null) => void;
  setSelectedDate: (date: string) => void;
  setSearchResults: (results: USDAFoodSearchResult[]) => void;
  addRecentFood: (food: { fdcId: number; name: string; calories: number }) => void;
  setIsSearching: (searching: boolean) => void;
  setTodayWaterMl: (ml: number) => void;
  addWater: (ml: number) => void;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayEntries: [],
  dailySummary: null,
  selectedDate: new Date().toISOString().split('T')[0],
  searchResults: [],
  recentFoods: [],
  isSearching: false,
  todayWaterMl: 0,

  setTodayEntries: (entries) => set({ todayEntries: entries }),

  addEntry: (entry) => {
    const entries = [...get().todayEntries, entry];
    set({ todayEntries: entries });
  },

  removeEntry: (id) => {
    const entries = get().todayEntries.filter((e) => e.id !== id);
    set({ todayEntries: entries });
  },

  setDailySummary: (summary) => set({ dailySummary: summary }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSearchResults: (results) => set({ searchResults: results }),

  addRecentFood: (food) => {
    const recent = get().recentFoods;
    const filtered = recent.filter((f) => f.fdcId !== food.fdcId);
    const updated = [food, ...filtered].slice(0, 20);
    set({ recentFoods: updated });
  },

  setIsSearching: (isSearching) => set({ isSearching }),
  setTodayWaterMl: (ml) => set({ todayWaterMl: ml }),

  addWater: (ml) => {
    set({ todayWaterMl: get().todayWaterMl + ml });
  },
}));
