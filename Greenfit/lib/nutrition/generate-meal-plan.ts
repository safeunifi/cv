/**
 * Offline meal plan generator.
 * Produces a 7-day plan using the app's built-in recipe data,
 * matching the user's macro targets and dietary preferences.
 */
import type { MealPlan, MealPlanEntry, Recipe } from '@/types/nutrition';

export interface GeneratedMealPlan {
  plan: Omit<MealPlan, 'id' | 'userId' | 'createdAt'>;
  entries: Array<Omit<MealPlanEntry, 'id' | 'mealPlanId'>>;
}

export interface MealPlanOptions {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  dietaryPreferences: string[];   // e.g. ['gluten_free', 'dairy_free']
  daysCount?: number;             // default 7
}

const MEAL_TYPES: Array<MealPlanEntry['mealType']> = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_CALORIE_SPLIT = {
  breakfast: 0.28,
  lunch: 0.32,
  dinner: 0.30,
  snack: 0.10,
};

/**
 * Assign recipes from a list to a 7-day meal plan.
 * Falls back to generating placeholder entries if no recipes are available.
 */
export function generateMealPlan(
  recipes: Recipe[],
  options: MealPlanOptions
): GeneratedMealPlan {
  const {
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    dietaryPreferences,
    daysCount = 7,
  } = options;

  // Filter recipes by dietary preferences
  const isGlutenFree = dietaryPreferences.includes('gluten_free');
  const isDairyFree = dietaryPreferences.includes('dairy_free') || dietaryPreferences.includes('vegan');

  const filtered = recipes.filter((r) => {
    if (isGlutenFree && !r.isGlutenFree) return false;
    if (isDairyFree && !r.isDairyFree) return false;
    return true;
  });

  // If we have no matching recipes, use all recipes as fallback
  const pool = filtered.length >= 8 ? filtered : recipes;

  const byMealType: Record<string, Recipe[]> = {
    breakfast: pool.filter((r) => r.mealTypes.includes('breakfast')),
    lunch: pool.filter((r) => r.mealTypes.includes('lunch')),
    dinner: pool.filter((r) => r.mealTypes.includes('dinner')),
    snack: pool.filter((r) => r.mealTypes.includes('snack')),
  };

  // Shuffle helper (deterministic shuffle based on index)
  function shuffled<T>(arr: T[]): T[] {
    return [...arr].sort((a, b) => (JSON.stringify(a).length % 7) - (JSON.stringify(b).length % 5));
  }

  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today.getTime() + (daysCount - 1) * 86400000).toISOString().split('T')[0];

  const entries: Array<Omit<MealPlanEntry, 'id' | 'mealPlanId'>> = [];
  let sortOrder = 0;

  for (let day = 0; day < daysCount; day++) {
    const date = new Date(today.getTime() + day * 86400000).toISOString().split('T')[0];

    for (const mealType of MEAL_TYPES) {
      const mealRecipes = shuffled(byMealType[mealType]);
      if (mealRecipes.length === 0) continue;

      // Pick a recipe cycling through the list across the week
      const recipe = mealRecipes[day % mealRecipes.length];

      // Calculate servings to hit calorie target for this meal slot
      const mealCalTarget = targetCalories * MEAL_CALORIE_SPLIT[mealType];
      const rawServings = recipe.caloriesPerServing > 0
        ? mealCalTarget / recipe.caloriesPerServing
        : 1;
      const servings = Math.max(0.5, Math.min(3, Math.round(rawServings * 2) / 2)); // round to 0.5

      entries.push({
        recipeId: recipe.id,
        planDate: date,
        mealType,
        servings,
        sortOrder: sortOrder++,
        recipe,
      });
    }
  }

  return {
    plan: {
      title: `${daysCount}-Day Golf Performance Plan`,
      startDate,
      endDate,
      isActive: true,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatG,
    },
    entries,
  };
}

/** Compute actual daily macro totals from a day's entries */
export function computeDayMacros(entries: Array<Omit<MealPlanEntry, 'id' | 'mealPlanId'> & { recipe?: Recipe }>) {
  return entries.reduce(
    (acc, entry) => {
      const r = entry.recipe;
      if (!r) return acc;
      const s = entry.servings;
      return {
        calories: acc.calories + r.caloriesPerServing * s,
        proteinG: acc.proteinG + r.proteinPerServing * s,
        carbsG: acc.carbsG + r.carbsPerServing * s,
        fatG: acc.fatG + r.fatPerServing * s,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
