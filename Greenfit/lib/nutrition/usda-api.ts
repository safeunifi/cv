import type { USDAFoodSearchResult } from '@/types/nutrition';

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || '';

// USDA nutrient IDs we care about
const NUTRIENT_IDS = {
  ENERGY: 1008,
  PROTEIN: 1003,
  TOTAL_FAT: 1004,
  CARBS: 1005,
  FIBER: 1079,
  SUGAR: 2000,
  SODIUM: 1093,
} as const;

export async function searchFoods(query: string, pageSize = 25): Promise<USDAFoodSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    api_key: API_KEY,
    query: query.trim(),
    dataType: 'Foundation,SR Legacy',
    pageSize: String(pageSize),
    sortBy: 'dataType.keyword',
    sortOrder: 'asc',
  });

  const response = await fetch(`${USDA_BASE_URL}/foods/search?${params}`);
  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status}`);
  }

  const data = await response.json();
  return data.foods || [];
}

export async function getFoodDetail(fdcId: number): Promise<USDAFoodSearchResult> {
  const nutrientIds = Object.values(NUTRIENT_IDS).join(',');
  const response = await fetch(
    `${USDA_BASE_URL}/food/${fdcId}?api_key=${API_KEY}&nutrients=${nutrientIds}`
  );
  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status}`);
  }
  return response.json();
}

export function extractMacros(nutrients: USDAFoodSearchResult['foodNutrients']) {
  const find = (id: number) => nutrients.find(n => n.nutrientId === id)?.value || 0;
  return {
    calories: Math.round(find(NUTRIENT_IDS.ENERGY) * 10) / 10,
    protein: Math.round(find(NUTRIENT_IDS.PROTEIN) * 10) / 10,
    carbs: Math.round(find(NUTRIENT_IDS.CARBS) * 10) / 10,
    fat: Math.round(find(NUTRIENT_IDS.TOTAL_FAT) * 10) / 10,
    fiber: Math.round(find(NUTRIENT_IDS.FIBER) * 10) / 10,
    sugar: Math.round(find(NUTRIENT_IDS.SUGAR) * 10) / 10,
    sodium: Math.round(find(NUTRIENT_IDS.SODIUM) * 10) / 10,
  };
}

// Scale macros by serving size (USDA returns per 100g)
export function scaleMacros(
  macros: ReturnType<typeof extractMacros>,
  servingGrams: number,
  numberOfServings: number
) {
  const factor = (servingGrams / 100) * numberOfServings;
  return {
    calories: Math.round(macros.calories * factor),
    protein: Math.round(macros.protein * factor * 10) / 10,
    carbs: Math.round(macros.carbs * factor * 10) / 10,
    fat: Math.round(macros.fat * factor * 10) / 10,
    fiber: Math.round(macros.fiber * factor * 10) / 10,
    sugar: Math.round(macros.sugar * factor * 10) / 10,
    sodium: Math.round(macros.sodium * factor * 10) / 10,
  };
}
