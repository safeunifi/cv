import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { MultiSelectCard } from '@/components/ui/MultiSelectCard';
import { INJURY_AREAS } from '@/constants/onboarding-options';
import type { InjuryArea } from '@/types/onboarding';

export default function InjuriesScreen() {
  const { injuryAreas, toggleInjury, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 7);
    router.push('/(onboarding)/training-schedule');
  };

  return (
    <OnboardingScreen
      step={7}
      totalSteps={10}
      title="Any Injuries?"
      subtitle="We'll avoid exercises that stress these areas. Select any that apply, or skip if none."
      onNext={handleNext}
      nextLabel={injuryAreas.length === 0 ? 'No Injuries — Skip' : 'Continue'}
    >
      <View className="gap-3">
        {INJURY_AREAS.map((area) => (
          <MultiSelectCard
            key={area.id}
            title={area.label}
            selected={injuryAreas.includes(area.id as InjuryArea)}
            onPress={() => toggleInjury(area.id as InjuryArea)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
