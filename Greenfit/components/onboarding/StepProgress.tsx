import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

export function StepProgress({ currentStep, totalSteps, onBack }: StepProgressProps) {
  const progress = currentStep / totalSteps;

  return (
    <View className="px-6 pt-2 pb-4">
      <View className="flex-row items-center justify-between mb-3">
        {currentStep > 1 ? (
          <Pressable onPress={onBack || (() => router.back())} className="py-1">
            <Text className="font-inter-medium text-base text-green-600">← Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text className="font-inter-medium text-sm text-sand-500">
          {currentStep} of {totalSteps}
        </Text>
      </View>
      <View className="h-1.5 bg-earth-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
