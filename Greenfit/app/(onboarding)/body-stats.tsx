import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { Pill } from '@/components/ui/Pill';
import { GENDER_OPTIONS } from '@/constants/onboarding-options';
import { kgToLbs, lbsToKg, cmToFeetInches, feetInchesToCm } from '@/lib/utils/units';
import { useState } from 'react';
import type { Gender } from '@/types/onboarding';

export default function BodyStatsScreen() {
  const store = useOnboardingStore();
  const [dobText, setDobText] = useState(store.dateOfBirth);

  const isImperial = store.useImperial;
  const displayWeight = isImperial ? Math.round(kgToLbs(store.weightKg)) : store.weightKg;
  const { feet, inches } = cmToFeetInches(store.heightCm);

  const handleNext = () => {
    store.setField('currentStep', 2);
    router.push('/(onboarding)/fitness-goals');
  };

  const setWeight = (value: number) => {
    if (isImperial) {
      store.setField('weightKg', lbsToKg(value));
    } else {
      store.setField('weightKg', value);
    }
  };

  const setHeightFeet = (f: number) => {
    store.setField('heightCm', feetInchesToCm(f, inches));
  };

  const setHeightInches = (i: number) => {
    store.setField('heightCm', feetInchesToCm(feet, i));
  };

  const handleDobChange = (text: string) => {
    // Auto-format: add dashes after MM and DD
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 4) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    if (cleaned.length >= 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    setDobText(formatted);
    if (formatted.length === 10) {
      store.setField('dateOfBirth', formatted);
    }
  };

  const isValid = store.dateOfBirth.length === 10 && store.weightKg > 0 && store.heightCm > 0;

  return (
    <OnboardingScreen
      step={2}
      totalSteps={10}
      title="About You"
      subtitle="We'll use this to calculate your targets"
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      {/* Units Toggle */}
      <View className="flex-row justify-center gap-2 mb-6">
        <Pill
          label="Imperial"
          selected={isImperial}
          onPress={() => store.setField('useImperial', true)}
        />
        <Pill
          label="Metric"
          selected={!isImperial}
          onPress={() => store.setField('useImperial', false)}
        />
      </View>

      {/* Date of Birth */}
      <View className="mb-6">
        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dobText}
          onChangeText={handleDobChange}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>

      {/* Gender */}
      <View className="mb-6">
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-2">
          Gender
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => (
            <Pill
              key={option.id}
              label={option.label}
              selected={store.gender === option.id}
              onPress={() => store.setField('gender', option.id as Gender)}
            />
          ))}
        </View>
      </View>

      {/* Height */}
      <View className="mb-6">
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-3">
          Height
        </Text>
        {isImperial ? (
          <View className="flex-row gap-6 justify-center">
            <Stepper
              value={feet}
              min={4}
              max={7}
              onChange={setHeightFeet}
              label="Feet"
            />
            <Stepper
              value={inches}
              min={0}
              max={11}
              onChange={setHeightInches}
              label="Inches"
            />
          </View>
        ) : (
          <Stepper
            value={Math.round(store.heightCm)}
            min={120}
            max={220}
            onChange={(v) => store.setField('heightCm', v)}
            label="cm"
          />
        )}
      </View>

      {/* Weight */}
      <View className="mb-6">
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-3">
          Weight
        </Text>
        <Stepper
          value={displayWeight}
          min={isImperial ? 80 : 35}
          max={isImperial ? 400 : 180}
          step={isImperial ? 1 : 0.5}
          onChange={setWeight}
          label={isImperial ? 'lbs' : 'kg'}
        />
      </View>
    </OnboardingScreen>
  );
}
