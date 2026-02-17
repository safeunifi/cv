import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { MultiSelectCard } from '@/components/ui/MultiSelectCard';
import { DIETARY_PREFERENCES } from '@/constants/onboarding-options';
import type { DietaryPreference } from '@/types/onboarding';

export default function DietaryPreferencesScreen() {
  const { dietaryPreferences, toggleDiet, setField } = useOnboardingStore();

  const handleNext = () => {
    setField('currentStep', 9);
    router.push('/(onboarding)/macro-results');
  };

  return (
    <OnboardingScreen
      step={9}
      totalSteps={10}
      title="Dietary Preferences"
      subtitle="All recipes and meal plans will respect your selections"
      onNext={handleNext}
    >
      <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
        <Text className="font-inter text-sm text-green-700 text-center">
          Gluten Free & Dairy Free are pre-selected as core to GreenFit
        </Text>
      </View>

      <View className="gap-3">
        {DIETARY_PREFERENCES.map((pref) => (
          <MultiSelectCard
            key={pref.id}
            title={pref.label}
            selected={dietaryPreferences.includes(pref.id as DietaryPreference)}
            onPress={() => toggleDiet(pref.id as DietaryPreference)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
