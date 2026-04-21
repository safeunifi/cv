import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { useNutritionStore } from '@/stores/nutrition-store';
import { useSettingsStore } from '@/stores/settings-store';
import { TodayMacroCard } from '@/components/dashboard/TodayMacroCard';
import { WaterWidget } from '@/components/dashboard/WaterWidget';
import { TodayWorkoutCard } from '@/components/dashboard/TodayWorkoutCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { getRelativeDay } from '@/lib/utils/date';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { todayWaterMl, addWater, dailySummary } = useNutritionStore();
  const { units, waterGoalMl } = useSettingsStore();

  const today = new Date();
  const greeting = getGreeting();
  const firstName = profile?.fullName?.split(' ')[0] || 'there';

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="font-inter text-sm text-sand-500">{getRelativeDay(today)}</Text>
          <Text className="font-inter-bold text-2xl text-sand-900 mt-1">
            {greeting}, {firstName}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-5">
          <QuickActions
            onLogFood={() => router.push('/(tabs)/nutrition/search')}
            onLogWater={() => router.push('/(tabs)/nutrition/water')}
            onStartWorkout={() => router.push('/(tabs)/fitness')}
            onViewRecipes={() => router.push('/(tabs)/nutrition/recipes')}
          />
        </View>

        {/* Macro Summary */}
        <View className="mb-4">
          <TodayMacroCard
            calories={dailySummary?.totalCalories || 0}
            targetCalories={profile?.targetCalories || 2000}
            proteinG={dailySummary?.totalProteinG || 0}
            targetProteinG={profile?.targetProteinG || 150}
            carbsG={dailySummary?.totalCarbsG || 0}
            targetCarbsG={profile?.targetCarbsG || 200}
            fatG={dailySummary?.totalFatG || 0}
            targetFatG={profile?.targetFatG || 65}
          />
        </View>

        {/* Water Widget */}
        <View className="mb-4">
          <WaterWidget
            currentMl={todayWaterMl}
            goalMl={waterGoalMl}
            onQuickAdd={addWater}
            imperial={units === 'imperial'}
          />
        </View>

        {/* Today's Workout */}
        <View className="mb-4">
          <TodayWorkoutCard
            hasActivePlan={false}
            onStartWorkout={() => router.push('/(tabs)/fitness/workout-plans/generate')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
