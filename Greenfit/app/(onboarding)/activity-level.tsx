import { View } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { SelectCard } from '@/components/ui/SelectCard';
import { ACTIVITY_LEVELS } from '@/constants/onboarding-options';
import type { ActivityLevel } from '@/types/onboarding';

export default function ActivityLevelScreen() {
  const { activityLevel, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 4);
    router.push('/(onboarding)/equipment');
  };

  return (
    <OnboardingScreen
      step={4}
      totalSteps={10}
      title="Activity Level"
      subtitle="How active are you on a typical week?"
      onNext={handleNext}
    >
      <View className="gap-3">
        {ACTIVITY_LEVELS.map((level) => (
          <SelectCard
            key={level.id}
            title={level.label}
            description={level.description}
            selected={activityLevel === level.id}
            onPress={() => setField('activityLevel', level.id as ActivityLevel)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
