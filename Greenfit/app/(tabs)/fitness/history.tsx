import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';

export default function WorkoutHistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Workout History</Text>
      </View>
      <View className="flex-1 items-center justify-center px-5">
        <Clock size={48} color="#D5CFC3" />
        <Text className="font-inter-semibold text-lg text-sand-700 mt-4">No Workouts Yet</Text>
        <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
          Complete your first workout and it will{'\n'}appear here for tracking.
        </Text>
      </View>
    </SafeAreaView>
  );
}
