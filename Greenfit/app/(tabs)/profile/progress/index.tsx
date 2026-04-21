import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, UtensilsCrossed, Dumbbell } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

export default function ProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6">
        <View className="flex-row items-center pt-4 gap-3 mb-6">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Progress</Text>
        </View>

        <View className="gap-3">
          <Card onPress={() => router.push('/(tabs)/profile/progress/weight')}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                <TrendingUp size={20} color="#4A7C59" />
              </View>
              <View>
                <Text className="font-inter-semibold text-base text-sand-800">Weight Trend</Text>
                <Text className="font-inter text-sm text-sand-500">Track your weight over time</Text>
              </View>
            </View>
          </Card>

          <Card onPress={() => router.push('/(tabs)/profile/progress/nutrition')}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-fairway-50 items-center justify-center">
                <UtensilsCrossed size={20} color="#0D9148" />
              </View>
              <View>
                <Text className="font-inter-semibold text-base text-sand-800">Nutrition Trends</Text>
                <Text className="font-inter text-sm text-sand-500">Macro adherence over time</Text>
              </View>
            </View>
          </Card>

          <Card onPress={() => router.push('/(tabs)/profile/progress/fitness')}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-earth-50 items-center justify-center">
                <Dumbbell size={20} color="#A68B5B" />
              </View>
              <View>
                <Text className="font-inter-semibold text-base text-sand-800">Fitness Progress</Text>
                <Text className="font-inter text-sm text-sand-500">Workout volume and PRs</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
