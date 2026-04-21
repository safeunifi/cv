import type { Gender, ActivityLevel, FitnessGoal } from '@/types/onboarding';
import type { MacroTargets } from '@/types/onboarding';

interface MacroInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  fitnessGoals: FitnessGoal[];
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateMacros(input: MacroInput): MacroTargets {
  // Step 1: BMR via Mifflin-St Jeor equation
  let bmr: number;
  if (input.gender === 'male') {
    bmr = (10 * input.weightKg) + (6.25 * input.heightCm) - (5 * input.age) + 5;
  } else {
    // female, other, prefer_not_to_say use female formula (more conservative)
    bmr = (10 * input.weightKg) + (6.25 * input.heightCm) - (5 * input.age) - 161;
  }

  // Step 2: TDEE = BMR x Activity Multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel] || 1.55;
  const tdee = bmr * multiplier;

  // Step 3: Caloric adjustment based on primary goal
  let targetCalories: number;
  if (input.fitnessGoals.includes('lose_fat')) {
    targetCalories = tdee * 0.80; // 20% deficit
  } else if (input.fitnessGoals.includes('build_muscle')) {
    targetCalories = tdee * 1.10; // 10% surplus
  } else {
    targetCalories = tdee; // maintenance
  }

  // Step 4: Macro split
  // Protein: 1g per lb for muscle/golf goals, 0.8g/lb otherwise
  const weightLbs = input.weightKg * 2.20462;
  let proteinG: number;
  if (input.fitnessGoals.includes('build_muscle') || input.fitnessGoals.includes('golf_performance')) {
    proteinG = weightLbs * 1.0;
  } else {
    proteinG = weightLbs * 0.8;
  }

  // Fat: 27% of total calories
  const fatCalories = targetCalories * 0.27;
  const fatG = fatCalories / 9;

  // Carbs: remainder
  const proteinCalories = proteinG * 4;
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbsG = Math.max(carbCalories / 4, 50); // minimum 50g carbs

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
}
