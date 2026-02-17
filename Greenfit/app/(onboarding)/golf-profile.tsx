import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { SelectCard } from '@/components/ui/SelectCard';
import { Input } from '@/components/ui/Input';
import { GOLF_EXPERIENCE } from '@/constants/onboarding-options';
import type { GolfExperience } from '@/types/onboarding';

export default function GolfProfileScreen() {
  const { golfExperience, golfHandicap, setField } = useOnboardingStore();
  const showHandicap = golfExperience !== 'none' && golfExperience !== 'beginner';

  const handleNext = () => {
    setField('currentStep', 6);
    router.push('/(onboarding)/injuries');
  };

  return (
    <OnboardingScreen
      step={6}
      totalSteps={10}
      title="Golf Profile"
      subtitle="This helps us tailor your training to your game"
      onNext={handleNext}
    >
      <View className="gap-3">
        {GOLF_EXPERIENCE.map((exp) => (
          <SelectCard
            key={exp.id}
            title={exp.label}
            description={exp.description}
            selected={golfExperience === exp.id}
            onPress={() => setField('golfExperience', exp.id as GolfExperience)}
          />
        ))}
      </View>

      {showHandicap && (
        <View className="mt-6">
          <Input
            label="Golf Handicap (optional)"
            placeholder="e.g., 15"
            value={golfHandicap?.toString() || ''}
            onChangeText={(text) => {
              const num = parseFloat(text);
              setField('golfHandicap', isNaN(num) ? null : num);
            }}
            keyboardType="decimal-pad"
          />
        </View>
      )}
    </OnboardingScreen>
  );
}
