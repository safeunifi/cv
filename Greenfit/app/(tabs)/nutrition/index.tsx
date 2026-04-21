import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, ChevronLeft, ChevronRight, Camera, Fuel } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { useNutritionStore } from '@/stores/nutrition-store';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import type { MealType } from '@/types/nutrition';

const MEAL_TYPES: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch', label: 'Lunch', emoji: '☀️' },
  { type: 'dinner', label: 'Dinner', emoji: '🌙' },
  { type: 'snack', label: 'Snacks', emoji: '🥜' },
];

export default function NutritionScreen() {
  const { profile } = useAuthStore();
  const { todayEntries, dailySummary } = useNutritionStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const showGolf = profile?.golfExperience && profile.golfExperience !== 'none';

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  const calories = dailySummary?.totalCalories || 0;
  const targetCalories = profile?.targetCalories || 2000;
  const remaining = Math.max(targetCalories - calories, 0);

  const entriesByMeal = (type: MealType) =>
    todayEntries.filter((e) => e.mealType === type);

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className="font-inter-bold text-2xl text-sand-900">Nutrition</Text>
        </View>

        {/* Date Selector */}
        <View className="flex-row items-center justify-center gap-4 mb-5">
          <Pressable onPress={() => setSelectedDate(subDays(selectedDate, 1))}>
            <ChevronLeft size={24} color="#9B917F" />
          </Pressable>
          <Text className="font-inter-semibold text-base text-sand-800">
            {isToday ? 'Today' : format(selectedDate, 'EEE, MMM d')}
          </Text>
          <Pressable onPress={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight size={24} color="#9B917F" />
          </Pressable>
        </View>

        {/* Calorie Summary */}
        <View className="items-center mb-6">
          <ProgressRing
            progress={targetCalories > 0 ? calories / targetCalories : 0}
            size={120}
            strokeWidth={10}
            color="#4A7C59"
            value={String(Math.round(remaining))}
            unit="cal left"
          />
          <View className="flex-row gap-6 mt-4">
            <View className="items-center">
              <Text className="font-inter-bold text-lg text-sand-900">{Math.round(calories)}</Text>
              <Text className="font-inter text-xs text-sand-500">Eaten</Text>
            </View>
            <View className="items-center">
              <Text className="font-inter-bold text-lg text-green-600">{targetCalories}</Text>
              <Text className="font-inter text-xs text-sand-500">Target</Text>
            </View>
            <View className="items-center">
              <Text className="font-inter-bold text-lg text-sand-900">{Math.round(remaining)}</Text>
              <Text className="font-inter text-xs text-sand-500">Remaining</Text>
            </View>
          </View>
        </View>

        {/* Meal Sections */}
        {MEAL_TYPES.map(({ type, label, emoji }) => {
          const entries = entriesByMeal(type);
          const mealCalories = entries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <Card key={type} className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">{emoji}</Text>
                  <Text className="font-inter-semibold text-base text-sand-800">{label}</Text>
                  {mealCalories > 0 && (
                    <Text className="font-inter text-sm text-sand-500">
                      {Math.round(mealCalories)} cal
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => router.push(`/(tabs)/nutrition/search?meal=${type}`)}
                  className="w-8 h-8 rounded-full bg-green-50 items-center justify-center"
                >
                  <Plus size={18} color="#4A7C59" />
                </Pressable>
              </View>

              {entries.length === 0 ? (
                <Pressable
                  onPress={() => router.push(`/(tabs)/nutrition/search?meal=${type}`)}
                >
                  <Text className="font-inter text-sm text-sand-400 py-2">
                    Tap + to add food
                  </Text>
                </Pressable>
              ) : (
                <View className="gap-2">
                  {entries.map((entry) => (
                    <View key={entry.id} className="flex-row justify-between py-1">
                      <View className="flex-1 mr-4">
                        <Text className="font-inter text-sm text-sand-800" numberOfLines={1}>
                          {entry.foodName}
                        </Text>
                        <Text className="font-inter text-xs text-sand-500">
                          {entry.numberOfServings} x {entry.servingSize}{entry.servingUnit}
                        </Text>
                      </View>
                      <Text className="font-inter-medium text-sm text-sand-700">
                        {Math.round(entry.calories)} cal
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}

        {/* AI Meal Scanner */}
        <Card
          onPress={() => router.push('/(tabs)/nutrition/meal-scanner')}
          className="mt-2 mb-3"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-2xl bg-green-500 items-center justify-center">
              <Camera size={28} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-lg text-sand-900">
                Meal Scanner
              </Text>
              <Text className="font-inter text-sm text-sand-500 mt-0.5">
                Snap a meal, get a healthier version with recipe
              </Text>
            </View>
          </View>
        </Card>

        {/* Course Fuel - shown for golfers */}
        {showGolf && (
          <Card
            onPress={() => router.push('/(tabs)/nutrition/course-fuel')}
            className="mb-3"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-2xl bg-earth-500 items-center justify-center">
                <Fuel size={28} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-lg text-sand-900">
                  Course Fuel
                </Text>
                <Text className="font-inter text-sm text-sand-500 mt-0.5">
                  On-course snacks & hydration for your round
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Links */}
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={() => router.push('/(tabs)/nutrition/meal-plans')}
            className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center"
          >
            <Text className="font-inter-medium text-sm text-green-700">Meal Plans</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/nutrition/recipes')}
            className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center"
          >
            <Text className="font-inter-medium text-sm text-green-700">Recipes</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/nutrition/grocery-list')}
            className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center"
          >
            <Text className="font-inter-medium text-sm text-green-700">Grocery List</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
