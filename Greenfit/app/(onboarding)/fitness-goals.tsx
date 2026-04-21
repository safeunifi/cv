import { View } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { MultiSelectCard } from '@/components/ui/MultiSelectCard';
import { FITNESS_GOALS } from '@/constants/onboarding-options';
import type { FitnessGoal } from '@/types/onboarding';

export default function FitnessGoalsScreen() {
  const { fitnessGoals, toggleGoal, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 3);
    router.push('/(onboarding)/activity-level');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={10}
      title="What are your goals?"
      subtitle="Select all that apply"
      onNext={handleNext}
      nextDisabled={fitnessGoals.length === 0}
    >
      <View className="gap-3">
        {FITNESS_GOALS.map((goal) => (
          <MultiSelectCard
            key={goal.id}
            title={goal.label}
            description={goal.description}
            selected={fitnessGoals.includes(goal.id as FitnessGoal)}
            onPress={() => toggleGoal(goal.id as FitnessGoal)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
