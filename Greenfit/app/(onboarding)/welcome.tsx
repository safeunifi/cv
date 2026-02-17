import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  const { fullName, setField } = useOnboardingStore();

  const handleContinue = () => {
    if (fullName.trim()) {
      setField('currentStep', 1);
      router.push('/(onboarding)/body-stats');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 px-6 justify-center">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-green-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl">⛳</Text>
          </View>
          <Text className="font-inter-bold text-3xl text-green-800">Welcome to GreenFit</Text>
          <Text className="font-inter text-base text-sand-500 mt-2 text-center">
            Let's build your personalized fitness{'\n'}and nutrition plan
          </Text>
        </View>

        <Input
          label="What's your name?"
          placeholder="Enter your name"
          value={fullName}
          onChangeText={(text) => setField('fullName', text)}
          autoCapitalize="words"
          autoFocus
        />

        <View className="mt-8">
          <Button
            title="Let's Get Started"
            onPress={handleContinue}
            disabled={!fullName.trim()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
