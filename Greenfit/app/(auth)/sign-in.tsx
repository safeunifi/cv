import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    // For MVP/testing: use a simple email magic link or email/password
    // This lets you test without Apple/Google OAuth setup
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@greenfit.app',
        password: 'testpassword123',
      });
      if (error) {
        // If user doesn't exist, sign them up
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'test@greenfit.app',
          password: 'testpassword123',
          options: {
            data: {
              full_name: 'Test User',
            },
          },
        });
        if (signUpError) {
          Alert.alert('Error', signUpError.message);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    // For initial testing, go straight to onboarding
    // This skips auth entirely for local development
    router.replace('/(onboarding)/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 px-6 justify-center">
        {/* Logo / Branding */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 rounded-full bg-green-500 items-center justify-center mb-4">
            <Text className="text-white text-4xl">⛳</Text>
          </View>
          <Text className="font-inter-bold text-4xl text-green-800">GreenFit</Text>
          <Text className="font-inter text-lg text-sand-500 mt-1">Fuel Your Game</Text>
        </View>

        {/* Sign In Options */}
        <View className="gap-3">
          <Button
            title="Continue with Email"
            onPress={handleEmailSignIn}
            variant="primary"
            loading={loading}
          />

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-earth-200" />
            <Text className="font-inter text-sm text-sand-500 mx-4">or</Text>
            <View className="flex-1 h-px bg-earth-200" />
          </View>

          <Button
            title="Continue as Guest (Testing)"
            onPress={handleGuestMode}
            variant="secondary"
          />
        </View>

        {/* Note for development */}
        <View className="mt-8 p-4 bg-earth-100 rounded-xl">
          <Text className="font-inter text-xs text-sand-600 text-center">
            Apple & Google Sign-In will be enabled for production.{'\n'}
            For now, use Guest mode to test the app.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
