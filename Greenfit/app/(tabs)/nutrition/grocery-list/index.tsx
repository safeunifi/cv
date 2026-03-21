import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShoppingCart, Check, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { buildGroceryList, groupByCategory, CATEGORY_LABELS } from '@/lib/nutrition/generate-grocery-list';
import type { GroceryListEntry } from '@/lib/nutrition/generate-grocery-list';
import type { GroceryCategory, RecipeIngredient } from '@/types/nutrition';

export default function GroceryListScreen() {
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const { session } = useAuthStore();

  const [items, setItems] = useState<GroceryListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<GroceryCategory>>(new Set());
  const [planTitle, setPlanTitle] = useState('Grocery List');

  const loadList = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) { setLoading(false); return; }

    // Find the target plan (passed planId or most recent active plan)
    let targetPlanId = planId;
    if (!targetPlanId) {
      const { data: activePlan } = await supabase
        .from('meal_plans')
        .select('id, title')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activePlan) {
        targetPlanId = activePlan.id;
        setPlanTitle(activePlan.title);
      }
    } else {
      const { data: p } = await supabase.from('meal_plans').select('title').eq('id', targetPlanId).single();
      if (p) setPlanTitle(p.title);
    }

    if (!targetPlanId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Load all entries for this plan with recipe ingredients
    const { data: entries, error } = await supabase
      .from('meal_plan_entries')
      .select(`
        servings,
        recipe_ingredients (
          id,
          recipe_id,
          food_name,
          quantity,
          unit,
          fdc_id,
          preparation_note,
          is_optional,
          sort_order,
          grocery_category
        )
      `)
      .eq('meal_plan_id', targetPlanId);

    if (error) {
      console.error('Error loading grocery list:', error);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Collect all ingredients (scaled by servings)
    const allIngredients: RecipeIngredient[] = [];
    for (const entry of entries ?? []) {
      const scaleFactor = entry.servings ?? 1;
      for (const ing of entry.recipe_ingredients ?? []) {
        allIngredients.push({
          id: ing.id,
          recipeId: ing.recipe_id,
          foodName: ing.food_name,
          quantity: ing.quantity != null ? ing.quantity * scaleFactor : null,
          unit: ing.unit,
          fdcId: ing.fdc_id,
          preparationNote: ing.preparation_note,
          isOptional: ing.is_optional ?? false,
          sortOrder: ing.sort_order ?? 0,
          groceryCategory: ing.grocery_category as GroceryCategory ?? 'other',
        });
      }
    }

    const list = buildGroceryList(allIngredients);
    setItems(list);
    setLoading(false);
    setRefreshing(false);
  }, [planId, session?.user?.id]);

  useEffect(() => { loadList(); }, [loadList]);

  const toggleItem = (sortOrder: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sortOrder === sortOrder ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const toggleCategory = (cat: GroceryCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const uncheckAll = () => setItems((prev) => prev.map((i) => ({ ...i, isChecked: false })));

  const checkedCount = items.filter((i) => i.isChecked).length;
  const groups = groupByCategory(items);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4A7C59" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 mb-2">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <View>
            <Text className="font-inter-bold text-2xl text-sand-900">Grocery List</Text>
            {items.length > 0 && (
              <Text className="font-inter text-xs text-sand-500">{planTitle}</Text>
            )}
          </View>
        </View>
        {checkedCount > 0 && (
          <Pressable onPress={uncheckAll} className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-100">
            <RefreshCw size={14} color="#9E9385" />
            <Text className="font-inter text-xs text-sand-600">Reset</Text>
          </Pressable>
        )}
      </View>

      {/* Progress */}
      {items.length > 0 && (
        <View className="mx-5 mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="font-inter text-xs text-sand-500">{checkedCount} of {items.length} items</Text>
            <Text className="font-inter-semibold text-xs text-green-700">
              {Math.round((checkedCount / items.length) * 100)}%
            </Text>
          </View>
          <View className="h-2 bg-earth-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${(checkedCount / items.length) * 100}%` }}
            />
          </View>
        </View>
      )}

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <ShoppingCart size={48} color="#D5CFC3" />
          <Text className="font-inter-semibold text-lg text-sand-700 mt-4">No Grocery List</Text>
          <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
            Generate a meal plan first and your{'\n'}grocery list will appear here.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/nutrition/meal-plans/generate')}
            className="mt-6 bg-green-500 rounded-xl px-6 py-3"
          >
            <Text className="font-inter-semibold text-white text-sm">Generate Meal Plan</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadList(); }} tintColor="#4A7C59" />}
        >
          {groups.map(({ category, label, items: catItems }) => {
            const collapsed = collapsedCategories.has(category);
            const catChecked = catItems.filter((i) => i.isChecked).length;

            return (
              <View key={category} className="mb-4">
                {/* Category header */}
                <Pressable
                  onPress={() => toggleCategory(category)}
                  className="flex-row items-center justify-between py-2"
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-semibold text-sm text-sand-700">{label}</Text>
                    <Text className="font-inter text-xs text-sand-400">
                      {catChecked}/{catItems.length}
                    </Text>
                  </View>
                  {collapsed
                    ? <ChevronRight size={16} color="#9E9385" />
                    : <ChevronDown size={16} color="#9E9385" />
                  }
                </Pressable>

                {!collapsed && (
                  <View className="bg-white rounded-2xl border border-earth-200 overflow-hidden">
                    {catItems.map((item, idx) => (
                      <Pressable
                        key={item.sortOrder}
                        onPress={() => toggleItem(item.sortOrder)}
                        className={`flex-row items-center px-4 py-3 ${idx < catItems.length - 1 ? 'border-b border-earth-100' : ''}`}
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                            item.isChecked ? 'bg-green-500 border-green-500' : 'border-earth-300'
                          }`}
                        >
                          {item.isChecked && <Check size={11} color="#fff" strokeWidth={3} />}
                        </View>

                        {/* Item name */}
                        <Text
                          className={`font-inter text-sm flex-1 ${
                            item.isChecked ? 'text-sand-400 line-through' : 'text-sand-800'
                          }`}
                        >
                          {item.ingredientName}
                        </Text>

                        {/* Quantity */}
                        {item.quantity != null && (
                          <Text className="font-inter text-xs text-sand-500 ml-2">
                            {formatQty(item.quantity)} {item.unit ?? ''}
                          </Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {checkedCount === items.length && items.length > 0 && (
            <View className="mt-2 bg-green-50 rounded-2xl border border-green-200 p-4 items-center">
              <Text className="font-inter-bold text-green-700 text-base">Shopping Complete!</Text>
              <Text className="font-inter text-green-600 text-sm mt-1">You got everything on the list.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatQty(qty: number): string {
  if (qty === Math.floor(qty)) return String(qty);
  return qty.toFixed(1);
}
