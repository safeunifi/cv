import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Droplets } from 'lucide-react-native';
import { useNutritionStore } from '@/stores/nutrition-store';
import { useSettingsStore } from '@/stores/settings-store';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { useState } from 'react';

export default function WaterScreen() {
  const { todayWaterMl, addWater } = useNutritionStore();
  const { units, waterGoalMl } = useSettingsStore();
  const [customAmount, setCustomAmount] = useState(250);

  const isImperial = units === 'imperial';
  const displayCurrent = isImperial ? Math.round(todayWaterMl / 29.5735) : todayWaterMl;
  const displayGoal = isImperial ? Math.round(waterGoalMl / 29.5735) : waterGoalMl;
  const unit = isImperial ? 'oz' : 'ml';
  const progress = waterGoalMl > 0 ? todayWaterMl / waterGoalMl : 0;

  const quickOptions = isImperial
    ? [
        { label: '8 oz', ml: 237 },
        { label: '12 oz', ml: 355 },
        { label: '16 oz', ml: 473 },
        { label: '24 oz', ml: 710 },
      ]
    : [
        { label: '250 ml', ml: 250 },
        { label: '350 ml', ml: 350 },
        { label: '500 ml', ml: 500 },
        { label: '750 ml', ml: 750 },
      ];

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-8">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Water Intake</Text>
        </View>

        {/* Progress Ring */}
        <View className="items-center mb-8">
          <ProgressRing
            progress={Math.min(progress, 1)}
            size={180}
            strokeWidth={14}
            color="#2980B9"
            value={`${displayCurrent}`}
            unit={`of ${displayGoal} ${unit}`}
          />
          {progress >= 1 && (
            <Text className="font-inter-semibold text-base text-blue-600 mt-3">
              Goal reached! Great job staying hydrated 💧
            </Text>
          )}
        </View>

        {/* Quick Add Buttons */}
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-3">
          Quick Add
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {quickOptions.map((option) => (
            <Pressable
              key={option.label}
              onPress={() => addWater(option.ml)}
              className="flex-1 min-w-[70px] py-3 bg-blue-50 border border-blue-200 rounded-xl items-center active:bg-blue-100"
            >
              <Droplets size={18} color="#2980B9" />
              <Text className="font-inter-medium text-sm text-blue-700 mt-1">
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom Amount */}
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-3">
          Custom Amount
        </Text>
        <View className="items-center mb-4">
          <Stepper
            value={isImperial ? Math.round(customAmount / 29.5735) : customAmount}
            min={isImperial ? 1 : 50}
            max={isImperial ? 64 : 2000}
            step={isImperial ? 1 : 50}
            onChange={(v) => setCustomAmount(isImperial ? Math.round(v * 29.5735) : v)}
            label={unit}
          />
        </View>
        <Button
          title={`Add ${isImperial ? Math.round(customAmount / 29.5735) : customAmount} ${unit}`}
          onPress={() => addWater(customAmount)}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}
