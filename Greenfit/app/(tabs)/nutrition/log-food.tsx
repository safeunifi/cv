import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pill } from '@/components/ui/Pill';
import { Stepper } from '@/components/ui/Stepper';
import { extractMacros, scaleMacros, getFoodDetail } from '@/lib/nutrition/usda-api';
import { useNutritionStore } from '@/stores/nutrition-store';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { MealType, USDAFoodSearchResult } from '@/types/nutrition';

const MEAL_OPTIONS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function LogFoodScreen() {
  const params = useLocalSearchParams<{
    fdcId: string;
    name: string;
    meal: string;
    nutrients?: string;
  }>();

  const { session } = useAuthStore();
  const { addEntry, addRecentFood } = useNutritionStore();

  const [servingSize, setServingSize] = useState(100);
  const [numberOfServings, setNumberOfServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>((params.meal as MealType) || 'snack');
  const [baseMacros, setBaseMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.nutrients) {
      try {
        const nutrients = JSON.parse(params.nutrients);
        setBaseMacros(extractMacros(nutrients));
      } catch {
        // If nutrients aren't passed, fetch from API
        loadFoodDetail();
      }
    } else {
      loadFoodDetail();
    }
  }, []);

  const loadFoodDetail = async () => {
    if (!params.fdcId) return;
    try {
      const food = await getFoodDetail(Number(params.fdcId));
      setBaseMacros(extractMacros(food.foodNutrients));
    } catch (err) {
      console.error('Error loading food:', err);
    }
  };

  const scaled = scaleMacros(baseMacros, servingSize, numberOfServings);

  const handleLog = async () => {
    setLoading(true);
    try {
      const entry = {
        id: `local-${Date.now()}`,
        userId: session?.user?.id || '',
        loggedDate: new Date().toISOString().split('T')[0],
        mealType,
        fdcId: params.fdcId ? Number(params.fdcId) : null,
        customFoodId: null,
        foodName: params.name || 'Unknown Food',
        brandName: null,
        servingSize,
        servingUnit: 'g',
        numberOfServings,
        calories: scaled.calories,
        proteinG: scaled.protein,
        carbsG: scaled.carbs,
        fatG: scaled.fat,
        fiberG: scaled.fiber,
        sugarG: scaled.sugar,
        sodiumMg: scaled.sodium,
        notes: null,
        createdAt: new Date().toISOString(),
      };

      // Add to local store immediately
      addEntry(entry);

      // Add to recent foods
      addRecentFood({
        fdcId: Number(params.fdcId) || 0,
        name: params.name || 'Unknown',
        calories: Math.round(baseMacros.calories),
      });

      // Save to Supabase if authenticated
      if (session?.user?.id) {
        await supabase.from('food_log_entries').insert({
          user_id: session.user.id,
          logged_date: entry.loggedDate,
          meal_type: mealType,
          fdc_id: entry.fdcId,
          food_name: entry.foodName,
          serving_size: servingSize,
          serving_unit: 'g',
          number_of_servings: numberOfServings,
          calories: scaled.calories,
          protein_g: scaled.protein,
          carbs_g: scaled.carbs,
          fat_g: scaled.fat,
          fiber_g: scaled.fiber,
          sugar_g: scaled.sugar,
          sodium_mg: scaled.sodium,
        });
      }

      router.back();
      router.back(); // Go back to nutrition index
    } catch (err) {
      Alert.alert('Error', 'Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="font-inter-bold text-2xl text-sand-900" numberOfLines={2}>
            {params.name || 'Log Food'}
          </Text>
          <Text className="font-inter text-sm text-sand-500 mt-1">per 100g from USDA</Text>
        </View>

        {/* Meal Type */}
        <View className="mb-5">
          <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-2">
            Meal
          </Text>
          <View className="flex-row gap-2">
            {MEAL_OPTIONS.map((m) => (
              <Pill
                key={m}
                label={m.charAt(0).toUpperCase() + m.slice(1)}
                selected={mealType === m}
                onPress={() => setMealType(m)}
              />
            ))}
          </View>
        </View>

        {/* Serving Size */}
        <View className="mb-5">
          <Stepper
            value={servingSize}
            min={10}
            max={1000}
            step={10}
            onChange={setServingSize}
            label="Serving Size (grams)"
            formatValue={(v) => `${v}g`}
          />
        </View>

        {/* Number of Servings */}
        <View className="mb-6">
          <Stepper
            value={numberOfServings}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setNumberOfServings}
            label="Number of Servings"
          />
        </View>

        {/* Macro Preview */}
        <Card className="mb-6">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Nutrition Info</Text>
          <View className="gap-2">
            <MacroLine label="Calories" value={`${scaled.calories}`} bold />
            <MacroLine label="Protein" value={`${scaled.protein}g`} />
            <MacroLine label="Carbs" value={`${scaled.carbs}g`} />
            <MacroLine label="Fat" value={`${scaled.fat}g`} />
            <MacroLine label="Fiber" value={`${scaled.fiber}g`} />
          </View>
        </Card>

        {/* Log Button */}
        <Button title="Log Food" onPress={handleLog} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

function MacroLine({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={`font-inter text-sm text-sand-600`}>{label}</Text>
      <Text className={`${bold ? 'font-inter-bold' : 'font-inter-medium'} text-sm text-sand-900`}>
        {value}
      </Text>
    </View>
  );
}
