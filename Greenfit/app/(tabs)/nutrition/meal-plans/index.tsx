import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Calendar } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MealPlansScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Meal Plans</Text>
      </View>
      <View className="flex-1 px-5 items-center justify-center">
        <Calendar size={48} color="#D5CFC3" />
        <Text className="font-inter-semibold text-lg text-sand-700 mt-4">No Meal Plans Yet</Text>
        <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
          Generate a personalized weekly meal plan{'\n'}based on your macro targets
        </Text>
        <View className="mt-6 w-full">
          <Button
            title="Generate Meal Plan"
            onPress={() => router.push('/(tabs)/nutrition/meal-plans/generate')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
