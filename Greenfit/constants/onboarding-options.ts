export const FITNESS_GOALS = [
  { id: 'lose_fat', label: 'Lose Fat', icon: 'Flame' as const, description: 'Reduce body fat while maintaining muscle' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'Dumbbell' as const, description: 'Increase strength and lean mass' },
  { id: 'improve_mobility', label: 'Improve Mobility', icon: 'StretchHorizontal' as const, description: 'Better flexibility and range of motion' },
  { id: 'golf_performance', label: 'Golf Performance', icon: 'Flag' as const, description: 'Swing speed, power, and course endurance' },
  { id: 'general_health', label: 'General Health', icon: 'Heart' as const, description: 'Overall wellness and energy' },
] as const;

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Desk job, little to no exercise' },
  { id: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { id: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'very_active', label: 'Very Active', description: 'Physical job + hard exercise' },
] as const;

export const EQUIPMENT_TIERS = [
  { id: 'none', label: 'No Equipment', icon: 'User' as const, description: 'Bodyweight exercises only' },
  { id: 'minimal', label: 'Minimal', icon: 'Dumbbell' as const, description: 'Resistance bands, light dumbbells' },
  { id: 'home_gym', label: 'Home Gym', icon: 'Home' as const, description: 'Barbell, bench, rack, dumbbells' },
  { id: 'full_gym', label: 'Full Gym', icon: 'Building' as const, description: 'Complete gym access' },
] as const;

export const GOLF_EXPERIENCE = [
  { id: 'none', label: "I Don't Play Golf", description: 'Skip golf-specific features' },
  { id: 'beginner', label: 'Beginner', description: 'New to golf or high handicap (25+)' },
  { id: 'intermediate', label: 'Intermediate', description: 'Regular player, handicap 10-25' },
  { id: 'advanced', label: 'Advanced', description: 'Competitive player, handicap under 10' },
] as const;

export const INJURY_AREAS = [
  { id: 'lower_back', label: 'Lower Back', region: 'torso' },
  { id: 'knees', label: 'Knees', region: 'legs' },
  { id: 'shoulders', label: 'Shoulders', region: 'upper' },
  { id: 'wrists', label: 'Wrists', region: 'upper' },
  { id: 'hips', label: 'Hips', region: 'torso' },
  { id: 'neck', label: 'Neck', region: 'upper' },
  { id: 'elbows', label: 'Elbows', region: 'upper' },
  { id: 'ankles', label: 'Ankles', region: 'legs' },
] as const;

export const DIETARY_PREFERENCES = [
  { id: 'gluten_free', label: 'Gluten Free', defaultChecked: true },
  { id: 'dairy_free', label: 'Dairy Free', defaultChecked: true },
  { id: 'vegetarian', label: 'Vegetarian', defaultChecked: false },
  { id: 'vegan', label: 'Vegan', defaultChecked: false },
  { id: 'nut_free', label: 'Nut Free', defaultChecked: false },
  { id: 'soy_free', label: 'Soy Free', defaultChecked: false },
  { id: 'egg_free', label: 'Egg Free', defaultChecked: false },
  { id: 'paleo', label: 'Paleo', defaultChecked: false },
  { id: 'keto', label: 'Keto', defaultChecked: false },
] as const;

export const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer Not to Say' },
] as const;
