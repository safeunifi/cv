/**
 * Generates a grocery list from a set of meal plan entries + recipe ingredients.
 * Groups items by grocery category and consolidates duplicates.
 */
import type { GroceryListItem, GroceryCategory, RecipeIngredient } from '@/types/nutrition';

export interface GroceryListEntry {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  groceryCategory: GroceryCategory;
  isChecked: boolean;
  sortOrder: number;
  notes: string | null;
}

export const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: 'Produce',
  protein: 'Protein & Meat',
  dairy_alternatives: 'Dairy & Alternatives',
  grains: 'Grains & Bread',
  pantry: 'Pantry & Canned',
  spices: 'Spices & Seasonings',
  frozen: 'Frozen',
  beverages: 'Beverages',
  condiments: 'Condiments & Sauces',
  other: 'Other',
};

export const CATEGORY_ORDER: GroceryCategory[] = [
  'produce', 'protein', 'dairy_alternatives', 'grains',
  'pantry', 'frozen', 'condiments', 'spices', 'beverages', 'other',
];

interface IngredientAccumulator {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
  groceryCategory: GroceryCategory;
  notes: string | null;
}

/**
 * Build a flat grocery list from an array of recipe ingredients (across all recipes in the plan).
 * Consolidates duplicates by name+unit.
 */
export function buildGroceryList(ingredients: RecipeIngredient[]): GroceryListEntry[] {
  // Key: normalized name + unit
  const map = new Map<string, IngredientAccumulator>();

  for (const ing of ingredients) {
    const key = `${ing.foodName.toLowerCase().trim()}__${(ing.unit || '').toLowerCase()}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      // Add quantities if both are numeric
      if (existing.quantity !== null && ing.quantity !== null) {
        existing.quantity = existing.quantity + ing.quantity;
      } else {
        existing.quantity = null; // mixed units — just list without quantity
      }
    } else {
      map.set(key, {
        ingredientName: capitalise(ing.foodName.trim()),
        quantity: ing.quantity ?? null,
        unit: ing.unit || null,
        groceryCategory: ing.groceryCategory,
        notes: ing.preparationNote || null,
      });
    }
  }

  // Sort by category order then name
  const items = Array.from(map.values());
  items.sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.groceryCategory);
    const catB = CATEGORY_ORDER.indexOf(b.groceryCategory);
    if (catA !== catB) return catA - catB;
    return a.ingredientName.localeCompare(b.ingredientName);
  });

  return items.map((item, i) => ({
    ...item,
    isChecked: false,
    sortOrder: i,
  }));
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Group a flat list by category for display */
export function groupByCategory(items: GroceryListEntry[]): Array<{
  category: GroceryCategory;
  label: string;
  items: GroceryListEntry[];
}> {
  const grouped = new Map<GroceryCategory, GroceryListEntry[]>();

  for (const item of items) {
    if (!grouped.has(item.groceryCategory)) {
      grouped.set(item.groceryCategory, []);
    }
    grouped.get(item.groceryCategory)!.push(item);
  }

  return CATEGORY_ORDER
    .filter((cat) => grouped.has(cat))
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: grouped.get(cat)!,
    }));
}
