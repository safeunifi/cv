import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Stepper } from '@/components/ui/Stepper';

export default function TrainingScheduleScreen() {
  const { trainingDaysPerWeek, fitnessGoals, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 8);
    router.push('/(onboarding)/dietary-preferences');
  };

  const getRecommendation = () => {
    if (fitnessGoals.includes('build_muscle')) return 'For muscle building, we recommend 4+ days';
    if (fitnessGoals.includes('golf_performance')) return 'For golf performance, 3-4 days is ideal';
    if (fitnessGoals.includes('lose_fat')) return 'For fat loss, 3-5 days works great';
    return 'For general health, 3+ days is a great start';
  };

  return (
    <OnboardingScreen
      step={8}
      totalSteps={10}
      title="Training Schedule"
      subtitle="How many days per week can you train?"
      onNext={handleNext}
    >
      <View className="items-center mt-8 mb-8">
        <Stepper
          value={trainingDaysPerWeek}
          min={1}
          max={7}
          onChange={(v) => setField('trainingDaysPerWeek', v)}
          label="days per week"
        />
      </View>

      {/* Weekly visual */}
      <View className="flex-row justify-center gap-2 mb-6">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <View
            key={i}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              i < trainingDaysPerWeek ? 'bg-green-500' : 'bg-earth-200'
            }`}
          >
            <Text
              className={`font-inter-semibold text-sm ${
                i < trainingDaysPerWeek ? 'text-white' : 'text-sand-500'
              }`}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Recommendation */}
      <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
        <Text className="font-inter text-sm text-green-700 text-center">
          💡 {getRecommendation()}
        </Text>
      </View>
    </OnboardingScreen>
  );
}
