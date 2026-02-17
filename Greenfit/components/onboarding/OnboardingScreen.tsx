import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepProgress } from './StepProgress';
import { Button } from '@/components/ui/Button';

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onBack?: () => void;
  showButton?: boolean;
}

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  onBack,
  showButton = true,
}: OnboardingScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <StepProgress currentStep={step} totalSteps={totalSteps} onBack={onBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="font-inter-bold text-3xl text-sand-900">{title}</Text>
            {subtitle && (
              <Text className="font-inter text-base text-sand-500 mt-2">{subtitle}</Text>
            )}
          </View>
          {children}
        </ScrollView>
        {showButton && (
          <View className="px-6 pb-4">
            <Button
              title={nextLabel}
              onPress={onNext}
              disabled={nextDisabled}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
