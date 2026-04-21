import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="body-stats" />
      <Stack.Screen name="fitness-goals" />
      <Stack.Screen name="activity-level" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="golf-profile" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="training-schedule" />
      <Stack.Screen name="dietary-preferences" />
      <Stack.Screen name="macro-results" />
    </Stack>
  );
}
