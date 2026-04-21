export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'active' | 'very_active';
export type EquipmentTier = 'none' | 'minimal' | 'home_gym' | 'full_gym';
export type GolfExperience = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'lose_fat' | 'build_muscle' | 'improve_mobility' | 'golf_performance' | 'general_health';
export type InjuryArea = 'lower_back' | 'knees' | 'shoulders' | 'wrists' | 'hips' | 'neck' | 'elbows' | 'ankles';
export type DietaryPreference = 'gluten_free' | 'dairy_free' | 'vegetarian' | 'vegan' | 'nut_free' | 'soy_free' | 'egg_free' | 'paleo' | 'keto';

export interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  fitnessGoals: FitnessGoal[];
  activityLevel: ActivityLevel;
  equipmentTier: EquipmentTier;
  golfExperience: GolfExperience;
  golfHandicap: number | null;
  injuryAreas: InjuryArea[];
  trainingDaysPerWeek: number;
  dietaryPreferences: DietaryPreference[];
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
