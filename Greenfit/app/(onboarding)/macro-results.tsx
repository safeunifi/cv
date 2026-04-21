import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAuthStore } from '@/stores/auth-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function MacroResultsScreen() {
  const store = useOnboardingStore();
  const { session, updateProfile } = useAuthStore();

  useEffect(() => {
    // Calculate macros when this screen loads
    store.computeMacros();
  }, []);

  const macros = store.macroTargets;

  const handleFinish = async () => {
    if (!macros) return;

    // Save to Supabase if we have a session
    if (session?.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: store.fullName,
          date_of_birth: store.dateOfBirth,
          height_cm: store.heightCm,
          current_weight_kg: store.weightKg,
          gender: store.gender,
          fitness_goals: store.fitnessGoals,
          activity_level: store.activityLevel,
          equipment_tier: store.equipmentTier,
          golf_experience: store.golfExperience,
          golf_handicap: store.golfHandicap,
          injury_areas: store.injuryAreas,
          training_days_per_week: store.trainingDaysPerWeek,
          dietary_preferences: store.dietaryPreferences,
          bmr: macros.bmr,
          tdee: macros.tdee,
          target_calories: macros.targetCalories,
          target_protein_g: macros.proteinG,
          target_carbs_g: macros.carbsG,
          target_fat_g: macros.fatG,
          units: store.useImperial ? 'imperial' : 'metric',
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error saving profile:', error);
      }

      // Refresh profile in auth store
      await updateProfile({
        fullName: store.fullName,
        onboardingCompleted: true,
        targetCalories: macros.targetCalories,
        targetProteinG: macros.proteinG,
        targetCarbsG: macros.carbsG,
        targetFatG: macros.fatG,
        equipmentTier: store.equipmentTier,
        fitnessGoals: store.fitnessGoals,
        trainingDaysPerWeek: store.trainingDaysPerWeek,
        units: store.useImperial ? 'imperial' : 'metric',
        injuryAreas: store.injuryAreas,
        dateOfBirth: store.dateOfBirth,
        activityLevel: store.activityLevel,
        heightCm: store.heightCm,
        currentWeightKg: store.weightKg,
        gender: store.gender,
        golfExperience: store.golfExperience,
      });
    }

    // Navigate to main app
    store.reset();
    router.replace('/(tabs)');
  };

  if (!macros) {
    return (
      <OnboardingScreen
        step={10}
        totalSteps={10}
        title="Calculating..."
        onNext={() => {}}
        showButton={false}
      >
        <View className="items-center mt-12">
          <Text className="font-inter text-base text-sand-500">Computing your targets...</Text>
        </View>
      </OnboardingScreen>
    );
  }

  const proteinCals = macros.proteinG * 4;
  const carbsCals = macros.carbsG * 4;
  const fatCals = macros.fatG * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  return (
    <OnboardingScreen
      step={10}
      totalSteps={10}
      title={`${store.fullName}, here's your plan`}
      subtitle="Your personalized daily nutrition targets"
      onNext={handleFinish}
      nextLabel="Start Your Journey"
    >
      {/* Calories Ring */}
      <View className="items-center mb-8">
        <ProgressRing
          progress={1}
          size={140}
          strokeWidth={12}
          color="#4A7C59"
          value={String(macros.targetCalories)}
          unit="calories"
        />
        <Text className="font-inter text-sm text-sand-500 mt-2">Daily Target</Text>
      </View>

      {/* Macro Breakdown */}
      <View className="flex-row justify-around mb-6">
        <View className="items-center">
          <ProgressRing
            progress={proteinCals / totalMacroCals}
            size={80}
            strokeWidth={6}
            color="#4A7C59"
            value={String(macros.proteinG)}
            unit="g"
          />
          <Text className="font-inter-medium text-sm text-sand-700 mt-2">Protein</Text>
        </View>
        <View className="items-center">
          <ProgressRing
            progress={carbsCals / totalMacroCals}
            size={80}
            strokeWidth={6}
            color="#34D67A"
            value={String(macros.carbsG)}
            unit="g"
          />
          <Text className="font-inter-medium text-sm text-sand-700 mt-2">Carbs</Text>
        </View>
        <View className="items-center">
          <ProgressRing
            progress={fatCals / totalMacroCals}
            size={80}
            strokeWidth={6}
            color="#A68B5B"
            value={String(macros.fatG)}
            unit="g"
          />
          <Text className="font-inter-medium text-sm text-sand-700 mt-2">Fat</Text>
        </View>
      </View>

      {/* Details Card */}
      <Card className="mb-4">
        <Text className="font-inter-semibold text-base text-sand-800 mb-3">How we calculated this</Text>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="font-inter text-sm text-sand-500">BMR (Basal Metabolic Rate)</Text>
            <Text className="font-inter-medium text-sm text-sand-800">{macros.bmr} cal</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-inter text-sm text-sand-500">TDEE (Total Daily Energy)</Text>
            <Text className="font-inter-medium text-sm text-sand-800">{macros.tdee} cal</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-inter text-sm text-sand-500">Daily Target</Text>
            <Text className="font-inter-semibold text-sm text-green-600">{macros.targetCalories} cal</Text>
          </View>
        </View>
      </Card>

      <View className="bg-earth-100 rounded-xl p-3">
        <Text className="font-inter text-xs text-sand-600 text-center">
          These targets adapt as you log your progress. You can adjust them anytime in Settings.
        </Text>
      </View>
    </OnboardingScreen>
  );
}
