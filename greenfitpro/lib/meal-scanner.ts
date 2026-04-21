export interface MealAnalysis {
  originalMeal: string;
  originalMacros: MacroBreakdown;
  concerns: string[];
  healthierName: string;
  healthierReason: string;
  recipe: RecipeStep[];
  ingredients: string[];
  healthierMacros: MacroBreakdown;
  tips: string[];
}

export interface MacroBreakdown {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface RecipeStep {
  step: number;
  instruction: string;
}

const ANALYSIS_PROMPT = `You are a sports nutrition expert. Analyze this meal and provide a healthier alternative.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "originalMeal": "Name of the meal you see",
  "originalMacros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 },
  "concerns": ["concern 1", "concern 2"],
  "healthierName": "Name of healthier version",
  "healthierReason": "Brief explanation of why it's better",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "recipe": [{ "step": 1, "instruction": "Step 1 text" }],
  "healthierMacros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 },
  "tips": ["tip 1", "tip 2"]
}

Rules:
- Estimate macros per serving as accurately as possible
- The healthier version should be a realistic, tasty alternative — not just "eat a salad"
- Keep the same cuisine style but make it cleaner (less processed, more whole foods, better macros)
- Include 4-8 recipe steps that are easy to follow
- All macro values should be numbers (no strings)
- Keep tips practical and actionable`;

export async function analyzeMealFromBase64(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
): Promise<MealAnalysis> {
  const res = await fetch("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "image", base64, mediaType }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeMealFromText(description: string): Promise<MealAnalysis> {
  const res = await fetch("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "text", description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function parseMacros(raw: Record<string, unknown> | undefined): MacroBreakdown {
  return {
    calories: Number(raw?.calories) || 0,
    protein: Number(raw?.protein) || 0,
    carbs: Number(raw?.carbs) || 0,
    fat: Number(raw?.fat) || 0,
    fiber: Number(raw?.fiber) || 0,
  };
}

export function parseAnalysisResponse(text: string): MealAnalysis {
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  const parsed = JSON.parse(jsonStr);
  return {
    originalMeal: parsed.originalMeal || "Unknown Meal",
    originalMacros: parseMacros(parsed.originalMacros),
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
    healthierName: parsed.healthierName || "Healthier Alternative",
    healthierReason: parsed.healthierReason || "",
    recipe: Array.isArray(parsed.recipe) ? parsed.recipe : [],
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    healthierMacros: parseMacros(parsed.healthierMacros),
    tips: Array.isArray(parsed.tips) ? parsed.tips : [],
  };
}

export { ANALYSIS_PROMPT };
