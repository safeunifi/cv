import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="progress/index" />
      <Stack.Screen name="progress/weight" />
      <Stack.Screen name="progress/nutrition" />
      <Stack.Screen name="progress/fitness" />
    </Stack>
  );
}
