import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell } from 'lucide-react-native';

export default function ActiveWorkoutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 items-center justify-center px-5">
        <Dumbbell size={48} color="#D5CFC3" />
        <Text className="font-inter-semibold text-lg text-sand-700 mt-4">Active Workout</Text>
        <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
          Generate a workout plan first, then start{'\n'}your workout from the Fitness tab.
        </Text>
      </View>
    </SafeAreaView>
  );
}
