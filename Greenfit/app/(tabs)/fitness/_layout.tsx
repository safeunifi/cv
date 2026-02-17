import { Stack } from 'expo-router';

export default function FitnessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="exercises/index" />
      <Stack.Screen name="exercises/[id]" />
      <Stack.Screen name="workout-plans/index" />
      <Stack.Screen name="workout-plans/[id]" />
      <Stack.Screen name="workout-plans/generate" />
      <Stack.Screen name="log/index" />
      <Stack.Screen name="log/[id]" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
