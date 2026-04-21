import { View } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { SelectCard } from '@/components/ui/SelectCard';
import { EQUIPMENT_TIERS } from '@/constants/onboarding-options';
import type { EquipmentTier } from '@/types/onboarding';

export default function EquipmentScreen() {
  const { equipmentTier, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 5);
    router.push('/(onboarding)/golf-profile');
  };

  return (
    <OnboardingScreen
      step={5}
      totalSteps={10}
      title="Equipment Access"
      subtitle="What equipment do you have available?"
      onNext={handleNext}
    >
      <View className="gap-3">
        {EQUIPMENT_TIERS.map((tier) => (
          <SelectCard
            key={tier.id}
            title={tier.label}
            description={tier.description}
            selected={equipmentTier === tier.id}
            onPress={() => setField('equipmentTier', tier.id as EquipmentTier)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
