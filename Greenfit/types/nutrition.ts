export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLogEntry {
  id: string;
  userId: string;
  loggedDate: string;
  mealType: MealType;
  fdcId: number | null;
  customFoodId: string | null;
  foodName: string;
  brandName: string | null;
  servingSize: number;
  servingUnit: string;
  numberOfServings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  notes: string | null;
  createdAt: string;
}

export interface CustomFood {
  id: string;
  userId: string;
  foodName: string;
  brandName: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  tags: string[];
  createdAt: string;
}

export interface WaterLogEntry {
  id: string;
  userId: string;
  loggedDate: string;
  amountMl: number;
  loggedAt: string;
}

export interface Recipe {
  id: string;
  createdBy: string | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  mealTypes: MealType[];
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  fiberPerServing: number;
  tags: string[];
  isGlutenFree: boolean;
  isDairyFree: boolean;
  instructions: RecipeStep[];
  difficulty: 'easy' | 'medium' | 'hard';
  isSystemRecipe: boolean;
  createdAt: string;
}

export interface RecipeStep {
  step: number;
  text: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  foodName: string;
  quantity: number;
  unit: string;
  fdcId: number | null;
  preparationNote: string | null;
  isOptional: boolean;
  sortOrder: number;
  groceryCategory: GroceryCategory;
}

export type GroceryCategory =
  | 'produce'
  | 'protein'
  | 'dairy_alternatives'
  | 'grains'
  | 'pantry'
  | 'spices'
  | 'frozen'
  | 'beverages'
  | 'condiments'
  | 'other';

export interface MealPlan {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  createdAt: string;
}

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  planDate: string;
  mealType: MealType;
  servings: number;
  sortOrder: number;
  recipe?: Recipe;
}

export interface GroceryList {
  id: string;
  userId: string;
  mealPlanId: string | null;
  title: string;
  createdAt: string;
}

export interface GroceryListItem {
  id: string;
  groceryListId: string;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  groceryCategory: GroceryCategory;
  isChecked: boolean;
  sortOrder: number;
  notes: string | null;
}

export interface USDAFoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface DailyNutritionSummary {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalWaterMl: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  mealsLogged: number;
}
