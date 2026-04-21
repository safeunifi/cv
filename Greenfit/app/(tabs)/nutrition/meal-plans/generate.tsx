import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function GenerateMealPlanScreen() {
  const { profile } = useAuthStore();

  const handleGenerate = () => {
    Alert.alert(
      'Coming Soon',
      'Meal plan generation will be available in the next update! For now, browse recipes and log food manually.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Generate Meal Plan</Text>
      </View>
      <View className="flex-1 px-5">
        <Card className="mb-4">
          <Text className="font-inter-semibold text-base text-sand-800 mb-2">Your Targets</Text>
          <View className="gap-1">
            <Text className="font-inter text-sm text-sand-600">
              Calories: {profile?.targetCalories || 2000} cal/day
            </Text>
            <Text className="font-inter text-sm text-sand-600">
              Protein: {profile?.targetProteinG || 150}g | Carbs: {profile?.targetCarbsG || 200}g | Fat: {profile?.targetFatG || 65}g
            </Text>
          </View>
        </Card>
        <Card className="mb-6">
          <Text className="font-inter-semibold text-base text-sand-800 mb-2">Plan Details</Text>
          <Text className="font-inter text-sm text-sand-600">
            7-day meal plan with breakfast, lunch, dinner, and snacks.
            All meals are gluten-free and dairy-free using whole food ingredients.
          </Text>
        </Card>
        <Button title="Generate Weekly Plan" onPress={handleGenerate} />
      </View>
    </SafeAreaView>
  );
}
