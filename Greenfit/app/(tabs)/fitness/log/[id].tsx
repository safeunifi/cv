import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutLogDetailScreen() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-1 px-5 items-center justify-center">
        <Text className="font-inter text-base text-sand-500">Workout Log {id} - Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
