import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="log-food" />
      <Stack.Screen name="custom-food" />
      <Stack.Screen name="water" />
      <Stack.Screen name="meal-plans/index" />
      <Stack.Screen name="meal-plans/generate" />
      <Stack.Screen name="recipes/index" />
      <Stack.Screen name="recipes/[id]" />
      <Stack.Screen name="grocery-list/index" />
    </Stack>
  );
}
