import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Calendar, ShoppingCart, ChevronRight, Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { MealPlan, MealPlanEntry, Recipe } from '@/types/nutrition';
import type { MealType } from '@/types/nutrition';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

interface EnrichedPlan extends MealPlan {
  entries: Array<MealPlanEntry & { recipe?: Recipe }>;
}

export default function MealPlansScreen() {
  const { session } = useAuthStore();
  const [plans, setPlans] = useState<EnrichedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_entries (
          *,
          recipes (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading meal plans:', error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const mapped: EnrichedPlan[] = (data ?? []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      title: p.title,
      startDate: p.start_date,
      endDate: p.end_date,
      isActive: p.is_active,
      targetCalories: p.target_calories,
      targetProteinG: p.target_protein_g,
      targetCarbsG: p.target_carbs_g,
      targetFatG: p.target_fat_g,
      createdAt: p.created_at,
      entries: (p.meal_plan_entries ?? []).map((e: any) => ({
        id: e.id,
        mealPlanId: e.meal_plan_id,
        recipeId: e.recipe_id,
        planDate: e.plan_date,
        mealType: e.meal_type as MealType,
        servings: e.servings,
        sortOrder: e.sort_order,
        recipe: e.recipes
          ? {
              id: e.recipes.id,
              createdBy: e.recipes.created_by,
              title: e.recipes.title,
              description: e.recipes.description,
              imageUrl: e.recipes.image_url,
              mealTypes: e.recipes.meal_types ?? [],
              prepTimeMinutes: e.recipes.prep_time_minutes,
              cookTimeMinutes: e.recipes.cook_time_minutes,
              servings: e.recipes.servings ?? 1,
              caloriesPerServing: e.recipes.calories_per_serving ?? 0,
              proteinPerServing: e.recipes.protein_per_serving ?? 0,
              carbsPerServing: e.recipes.carbs_per_serving ?? 0,
              fatPerServing: e.recipes.fat_per_serving ?? 0,
              fiberPerServing: e.recipes.fiber_per_serving ?? 0,
              tags: e.recipes.tags ?? [],
              isGlutenFree: e.recipes.is_gluten_free ?? false,
              isDairyFree: e.recipes.is_dairy_free ?? false,
              instructions: e.recipes.instructions ?? [],
              difficulty: e.recipes.difficulty ?? 'easy',
              isSystemRecipe: e.recipes.is_system_recipe ?? true,
              createdAt: e.recipes.created_at,
            }
          : undefined,
      })),
    }));

    setPlans(mapped);
    setLoading(false);
    setRefreshing(false);

    // Auto-expand the most recent plan
    if (mapped.length > 0 && !expandedPlan) {
      setExpandedPlan(mapped[0].id);
    }
  }, [session?.user?.id]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleRefresh = () => { setRefreshing(true); loadPlans(); };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4A7C59" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center justify-between px-5 pt-4 mb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Meal Plans</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/nutrition/meal-plans/generate')}
          className="bg-green-500 rounded-xl p-2"
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      {plans.length === 0 ? (
        <View className="flex-1 px-5 items-center justify-center">
          <Calendar size={48} color="#D5CFC3" />
          <Text className="font-inter-semibold text-lg text-sand-700 mt-4">No Meal Plans Yet</Text>
          <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
            Generate a personalized weekly meal plan{'\n'}based on your macro targets
          </Text>
          <View className="mt-6 w-full">
            <Button
              title="Generate Meal Plan"
              onPress={() => router.push('/(tabs)/nutrition/meal-plans/generate')}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4A7C59" />}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              expanded={expandedPlan === plan.id}
              onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PlanCard({
  plan,
  expanded,
  onToggle,
}: {
  plan: EnrichedPlan;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Get unique dates in the plan
  const dates = [...new Set(plan.entries.map((e) => e.planDate))].sort();

  const totalCal = plan.entries.reduce((sum, e) => {
    return sum + (e.recipe ? e.recipe.caloriesPerServing * e.servings : 0);
  }, 0);
  const avgDailyCal = dates.length > 0 ? Math.round(totalCal / dates.length) : 0;

  return (
    <View className="bg-white rounded-2xl border border-earth-200 overflow-hidden">
      {/* Header */}
      <Pressable onPress={onToggle} className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-inter-bold text-base text-sand-900">{plan.title}</Text>
              {plan.isActive && (
                <View className="bg-green-100 rounded-full px-2 py-0.5">
                  <Text className="font-inter-semibold text-xs text-green-700">Active</Text>
                </View>
              )}
            </View>
            <Text className="font-inter text-xs text-sand-500 mt-1">
              {plan.startDate} → {plan.endDate} · {dates.length} days · ~{avgDailyCal} cal/day
            </Text>
          </View>
          <ChevronRight
            size={18}
            color="#9E9385"
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </View>

        {/* Macro summary */}
        <View className="flex-row gap-4 mt-3">
          <MacroTag label="Protein" value={`${plan.targetProteinG}g`} color="#4A7C59" />
          <MacroTag label="Carbs" value={`${plan.targetCarbsG}g`} color="#3498DB" />
          <MacroTag label="Fat" value={`${plan.targetFatG}g`} color="#9B59B6" />
        </View>
      </Pressable>

      {/* Grocery list button */}
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/nutrition/grocery-list/index', params: { planId: plan.id } })}
        className="mx-4 mb-3 flex-row items-center justify-center gap-2 bg-sand-100 rounded-xl py-2.5"
      >
        <ShoppingCart size={16} color="#4A7C59" />
        <Text className="font-inter-semibold text-sm text-green-700">View Grocery List</Text>
      </Pressable>

      {/* Day entries (expanded) */}
      {expanded && dates.map((date) => {
        const dayEntries = plan.entries
          .filter((e) => e.planDate === date)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        return (
          <View key={date} className="border-t border-earth-100 px-4 py-3">
            <Text className="font-inter-semibold text-sm text-sand-700 mb-2">{label}</Text>
            {dayEntries.map((entry) => (
              <View key={entry.id} className="flex-row items-start mb-1.5">
                <Text className="font-inter text-xs text-sand-500 w-20">{MEAL_TYPE_LABELS[entry.mealType]}</Text>
                <Text className="font-inter text-xs text-sand-800 flex-1" numberOfLines={1}>
                  {entry.recipe?.title ?? 'Recipe'}{entry.servings !== 1 ? ` ×${entry.servings}` : ''}
                </Text>
                {entry.recipe && (
                  <Text className="font-inter text-xs text-sand-500 ml-2">
                    {Math.round(entry.recipe.caloriesPerServing * entry.servings)}cal
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function MacroTag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text className="font-inter text-xs text-sand-600">{label}: <Text className="font-inter-semibold" style={{ color }}>{value}</Text></Text>
    </View>
  );
}
