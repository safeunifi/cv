import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Zap, Target, Leaf, Calendar } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { generateMealPlan } from '@/lib/nutrition/generate-meal-plan';
import type { Recipe } from '@/types/nutrition';

const DAYS_OPTIONS = [3, 5, 7];

export default function GenerateMealPlanScreen() {
  const { profile, session } = useAuthStore();
  const [daysCount, setDaysCount] = useState(7);
  const [loading, setLoading] = useState(false);

  const targetCalories = profile?.targetCalories ?? 2000;
  const targetProteinG = profile?.targetProteinG ?? 150;
  const targetCarbsG = profile?.targetCarbsG ?? 200;
  const targetFatG = profile?.targetFatG ?? 65;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Load recipes from Supabase
      const { data: recipeData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (*)
        `)
        .eq('is_system_recipe', true);

      if (error) throw error;

      const recipes: Recipe[] = (recipeData ?? []).map((r: any) => ({
        id: r.id,
        createdBy: r.created_by,
        title: r.title,
        description: r.description,
        imageUrl: r.image_url,
        mealTypes: r.meal_types ?? [],
        prepTimeMinutes: r.prep_time_minutes,
        cookTimeMinutes: r.cook_time_minutes,
        servings: r.servings ?? 1,
        caloriesPerServing: r.calories_per_serving ?? 0,
        proteinPerServing: r.protein_per_serving ?? 0,
        carbsPerServing: r.carbs_per_serving ?? 0,
        fatPerServing: r.fat_per_serving ?? 0,
        fiberPerServing: r.fiber_per_serving ?? 0,
        tags: r.tags ?? [],
        isGlutenFree: r.is_gluten_free ?? false,
        isDairyFree: r.is_dairy_free ?? false,
        instructions: r.instructions ?? [],
        difficulty: r.difficulty ?? 'easy',
        isSystemRecipe: r.is_system_recipe ?? true,
        createdAt: r.created_at,
      }));

      if (recipes.length === 0) {
        Alert.alert(
          'No Recipes Found',
          'Add recipes to your database first, or they will be seeded automatically on first launch.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const { plan, entries } = generateMealPlan(recipes, {
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatG,
        dietaryPreferences: profile ? [] : [],
        daysCount,
      });

      // Save plan to Supabase
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data: savedPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          title: plan.title,
          start_date: plan.startDate,
          end_date: plan.endDate,
          is_active: true,
          target_calories: plan.targetCalories,
          target_protein_g: plan.targetProteinG,
          target_carbs_g: plan.targetCarbsG,
          target_fat_g: plan.targetFatG,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Save entries
      const entryRows = entries.map((e) => ({
        meal_plan_id: savedPlan.id,
        recipe_id: e.recipeId,
        plan_date: e.planDate,
        meal_type: e.mealType,
        servings: e.servings,
        sort_order: e.sortOrder,
      }));

      const { error: entryError } = await supabase
        .from('meal_plan_entries')
        .insert(entryRows);

      if (entryError) throw entryError;

      router.replace('/(tabs)/nutrition/meal-plans/index');
    } catch (err: any) {
      console.error('Meal plan generation error:', err);
      Alert.alert('Error', err?.message ?? 'Could not generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Generate Meal Plan</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
        {/* Macro targets */}
        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Target size={18} color="#4A7C59" />
            <Text className="font-inter-semibold text-base text-sand-800">Your Daily Targets</Text>
          </View>
          <View className="flex-row justify-between">
            <MacroChip label="Calories" value={`${targetCalories}`} unit="cal" color="#E67E22" />
            <MacroChip label="Protein" value={`${targetProteinG}g`} unit="" color="#4A7C59" />
            <MacroChip label="Carbs" value={`${targetCarbsG}g`} unit="" color="#3498DB" />
            <MacroChip label="Fat" value={`${targetFatG}g`} unit="" color="#9B59B6" />
          </View>
        </Card>

        {/* Days selector */}
        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Calendar size={18} color="#4A7C59" />
            <Text className="font-inter-semibold text-base text-sand-800">Plan Duration</Text>
          </View>
          <View className="flex-row gap-3">
            {DAYS_OPTIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDaysCount(d)}
                className={`flex-1 py-3 rounded-xl items-center border-2 ${
                  daysCount === d
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-earth-200'
                }`}
              >
                <Text className={`font-inter-bold text-base ${daysCount === d ? 'text-white' : 'text-sand-700'}`}>
                  {d}
                </Text>
                <Text className={`font-inter text-xs ${daysCount === d ? 'text-green-100' : 'text-sand-500'}`}>
                  days
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* What's included */}
        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Leaf size={18} color="#4A7C59" />
            <Text className="font-inter-semibold text-base text-sand-800">What's Included</Text>
          </View>
          {[
            'Breakfast, lunch, dinner & snacks every day',
            'Meals sized to hit your calorie targets',
            'Recipes matched to your dietary preferences',
            'Auto-generated grocery list',
          ].map((item) => (
            <View key={item} className="flex-row items-start gap-2 mb-1">
              <Zap size={14} color="#4A7C59" />
              <Text className="font-inter text-sm text-sand-600 flex-1">{item}</Text>
            </View>
          ))}
        </Card>

        <Button
          title={loading ? 'Generating...' : `Generate ${daysCount}-Day Plan`}
          onPress={handleGenerate}
          loading={loading}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroChip({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <View className="items-center">
      <Text style={{ color }} className="font-inter-bold text-base">{value}{unit}</Text>
      <Text className="font-inter text-xs text-sand-500 mt-0.5">{label}</Text>
    </View>
  );
}
