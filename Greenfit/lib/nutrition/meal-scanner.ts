/**
 * AI Meal Scanner Service
 *
 * Takes a photo of a meal (or a text description), sends it to the Claude API
 * for analysis, and returns:
 * 1. What the meal appears to be
 * 2. Estimated macros of the original meal
 * 3. A healthier alternative recipe with macros
 *
 * Requires EXPO_PUBLIC_ANTHROPIC_API_KEY env variable.
 */

import * as FileSystem from 'expo-file-system';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';

export interface MealAnalysis {
  /** What the AI identified the meal as */
  originalMeal: string;
  /** Estimated macros of the original */
  originalMacros: MacroBreakdown;
  /** What makes the original less healthy */
  concerns: string[];
  /** Healthier alternative name */
  healthierName: string;
  /** Why it's healthier */
  healthierReason: string;
  /** Full recipe */
  recipe: RecipeStep[];
  /** Ingredients list */
  ingredients: string[];
  /** Macros for the healthier version */
  healthierMacros: MacroBreakdown;
  /** Quick tips */
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

/**
 * Analyze a meal photo and get a healthier alternative.
 */
export async function analyzeMealPhoto(photoUri: string): Promise<MealAnalysis> {
  if (!API_KEY) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  // Read image as base64
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine media type from URI
  const ext = photoUri.split('.').pop()?.toLowerCase() || 'jpeg';
  const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  return parseAnalysisResponse(text);
}

/**
 * Analyze a meal from text description (fallback when camera isn't available).
 */
export async function analyzeMealText(description: string): Promise<MealAnalysis> {
  if (!API_KEY) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `The user describes this meal: "${description}"\n\n${ANALYSIS_PROMPT}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  return parseAnalysisResponse(text);
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

function parseAnalysisResponse(text: string): MealAnalysis {
  // Try to extract JSON from the response
  let jsonStr = text.trim();

  // Handle if wrapped in markdown code blocks
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      originalMeal: parsed.originalMeal || 'Unknown Meal',
      originalMacros: parseMacros(parsed.originalMacros),
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      healthierName: parsed.healthierName || 'Healthier Alternative',
      healthierReason: parsed.healthierReason || '',
      recipe: Array.isArray(parsed.recipe) ? parsed.recipe : [],
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      healthierMacros: parseMacros(parsed.healthierMacros),
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    };
  } catch {
    throw new Error('Could not parse AI response. Please try again.');
  }
}

function parseMacros(raw: Record<string, unknown> | undefined): MacroBreakdown {
  return {
    calories: Number(raw?.calories) || 0,
    protein: Number(raw?.protein) || 0,
    carbs: Number(raw?.carbs) || 0,
    fat: Number(raw?.fat) || 0,
    fiber: Number(raw?.fiber) || 0,
  };
}
