import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useAuthStore } from '@/stores/auth-store';
import { useFitnessStore } from '@/stores/fitness-store';
import { supabase } from '@/lib/supabase';
import '../global.css';

export default function RootLayout() {
  const { setSession, fetchProfile, setLoading, setInitialized, isInitialized } = useAuthStore();
  const { fetchExercises } = useFitnessStore();
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await fetchProfile();
      }
      setLoading(false);
      setInitialized(true);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile();
      }
      setLoading(false);
      setInitialized(true);
    });

    // Pre-load exercise library (system exercises are publicly readable)
    fetchExercises();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      setAppReady(true);
    }
  }, [fontsLoaded, isInitialized]);

  if (!appReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
