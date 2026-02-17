import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useFitnessStore } from '@/stores/fitness-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateWorkoutPlan, type UserProfile } from '@/lib/fitness/generate-plan';
import { savePlanToSupabase } from '@/lib/fitness/save-plan';

export default function GenerateWorkoutPlanScreen() {
  const { profile, session } = useAuthStore();
  const onboarding = useOnboardingStore();
  const { exercises, fetchExercises } = useFitnessStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Build user profile from auth store + onboarding store fallback
  const userProfile: UserProfile = {
    equipmentTier: profile?.equipmentTier || onboarding.equipmentTier || 'none',
    trainingDaysPerWeek: profile?.trainingDaysPerWeek || onboarding.trainingDaysPerWeek || 3,
    fitnessGoals: (profile?.fitnessGoals?.length ? profile.fitnessGoals : onboarding.fitnessGoals) || [],
    injuryAreas: (profile?.injuryAreas?.length ? profile.injuryAreas : onboarding.injuryAreas) || [],
    dateOfBirth: profile?.dateOfBirth || onboarding.dateOfBirth || null,
    golfExperience: profile?.golfExperience || onboarding.golfExperience || null,
  };

  const handleGenerate = async () => {
    // Ensure exercises are loaded
    if (exercises.length === 0) {
      await fetchExercises();
      // Check again after fetch
      const currentExercises = useFitnessStore.getState().exercises;
      if (currentExercises.length === 0) {
        Alert.alert(
          'No Exercises',
          'Could not load the exercise library. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setIsGenerating(true);

    try {
      // Get the latest exercises from the store
      const currentExercises = useFitnessStore.getState().exercises;

      // Generate the plan
      const plan = generateWorkoutPlan(currentExercises, userProfile);

      // Validate the plan has exercises
      const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0);
      if (totalExercises === 0) {
        Alert.alert(
          'Generation Issue',
          'Could not generate exercises for your plan. Try adjusting your equipment tier or injury settings.',
          [{ text: 'OK' }]
        );
        setIsGenerating(false);
        return;
      }

      // Save to Supabase if authenticated
      if (session?.user?.id) {
        const planId = await savePlanToSupabase(plan, session.user.id);
        setIsGenerating(false);
        router.replace(`/(tabs)/fitness/workout-plans/${planId}`);
      } else {
        // Guest mode: show the plan locally without saving
        setIsGenerating(false);
        // Navigate to plan detail with plan data as params
        router.replace({
          pathname: '/(tabs)/fitness/workout-plans/[id]',
          params: { id: 'preview', planData: JSON.stringify(plan) },
        });
      }
    } catch (err: any) {
      setIsGenerating(false);
      console.error('Error generating plan:', err);
      Alert.alert(
        'Error',
        err?.message || 'Something went wrong while generating your plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const displayEquipment = userProfile.equipmentTier || 'none';
  const displayGoals = userProfile.fitnessGoals.length > 0
    ? userProfile.fitnessGoals.join(', ')
    : 'Not set';
  const displayDays = userProfile.trainingDaysPerWeek;
  const displayInjuries = userProfile.injuryAreas.length > 0
    ? userProfile.injuryAreas.join(', ')
    : 'None';

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6">
        <View className="flex-row items-center pt-4 gap-3 mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Generate Plan</Text>
        </View>

        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-3">Your Profile</Text>
          <View className="gap-2">
            <ProfileRow label="Equipment" value={displayEquipment} />
            <ProfileRow label="Goals" value={displayGoals} />
            <ProfileRow label="Training Days" value={`${displayDays} days/week`} />
            <ProfileRow label="Injuries" value={displayInjuries} />
            {exercises.length > 0 && (
              <ProfileRow label="Exercise Pool" value={`${exercises.length} exercises`} />
            )}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-2">What You'll Get</Text>
          <View className="gap-2">
            <Text className="font-inter text-sm text-sand-600">
              {'\u2022'} Personalized {displayDays}-day training split
            </Text>
            <Text className="font-inter text-sm text-sand-600">
              {'\u2022'} Golf mobility warm-ups for each session
            </Text>
            <Text className="font-inter text-sm text-sand-600">
              {'\u2022'} Progressive overload tracking
            </Text>
            <Text className="font-inter text-sm text-sand-600">
              {'\u2022'} Age-appropriate exercise selection (40+ friendly)
            </Text>
            <Text className="font-inter text-sm text-sand-600">
              {'\u2022'} Injury-aware programming
            </Text>
          </View>
        </Card>

        {isGenerating ? (
          <View className="items-center py-6">
            <Sparkles size={32} color="#4A7C59" />
            <Text className="font-inter-semibold text-base text-green-600 mt-3">
              Generating your plan...
            </Text>
            <Text className="font-inter text-sm text-sand-400 mt-1">
              Building your personalized {displayDays}-day program
            </Text>
          </View>
        ) : (
          <Button
            title="Generate My Plan"
            onPress={handleGenerate}
            loading={isGenerating}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="font-inter text-sm text-sand-500">{label}</Text>
      <Text className="font-inter-medium text-sm text-sand-800 capitalize">{value.replace(/_/g, ' ')}</Text>
    </View>
  );
}
