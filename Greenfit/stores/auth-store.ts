import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  units: 'imperial' | 'metric';
  targetCalories: number | null;
  targetProteinG: number | null;
  targetCarbsG: number | null;
  targetFatG: number | null;
  equipmentTier: string | null;
  fitnessGoals: string[];
  trainingDaysPerWeek: number | null;
  injuryAreas: string[];
  dateOfBirth: string | null;
  activityLevel: string | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  gender: string | null;
  golfExperience: string | null;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      set({
        profile: {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          onboardingCompleted: data.onboarding_completed ?? false,
          units: data.units ?? 'imperial',
          targetCalories: data.target_calories,
          targetProteinG: data.target_protein_g,
          targetCarbsG: data.target_carbs_g,
          targetFatG: data.target_fat_g,
          equipmentTier: data.equipment_tier,
          fitnessGoals: data.fitness_goals ?? [],
          trainingDaysPerWeek: data.training_days_per_week,
          injuryAreas: data.injury_areas ?? [],
          dateOfBirth: data.date_of_birth,
          activityLevel: data.activity_level,
          heightCm: data.height_cm,
          currentWeightKg: data.current_weight_kg,
          gender: data.gender,
          golfExperience: data.golf_experience,
        },
      });
    }
  },

  updateProfile: async (updates) => {
    const { session, profile } = get();
    if (!session?.user?.id || !profile) return;

    // Map camelCase to snake_case for Supabase
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.units !== undefined) dbUpdates.units = updates.units;
    if (updates.targetCalories !== undefined) dbUpdates.target_calories = updates.targetCalories;
    if (updates.targetProteinG !== undefined) dbUpdates.target_protein_g = updates.targetProteinG;
    if (updates.targetCarbsG !== undefined) dbUpdates.target_carbs_g = updates.targetCarbsG;
    if (updates.targetFatG !== undefined) dbUpdates.target_fat_g = updates.targetFatG;
    if (updates.equipmentTier !== undefined) dbUpdates.equipment_tier = updates.equipmentTier;
    if (updates.fitnessGoals !== undefined) dbUpdates.fitness_goals = updates.fitnessGoals;
    if (updates.trainingDaysPerWeek !== undefined) dbUpdates.training_days_per_week = updates.trainingDaysPerWeek;
    if (updates.injuryAreas !== undefined) dbUpdates.injury_areas = updates.injuryAreas;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.activityLevel !== undefined) dbUpdates.activity_level = updates.activityLevel;
    if (updates.heightCm !== undefined) dbUpdates.height_cm = updates.heightCm;
    if (updates.currentWeightKg !== undefined) dbUpdates.current_weight_kg = updates.currentWeightKg;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.golfExperience !== undefined) dbUpdates.golf_experience = updates.golfExperience;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    set({ profile: { ...profile, ...updates } });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
