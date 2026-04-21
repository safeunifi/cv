import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function NutritionProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Nutrition Trends</Text>
      </View>
      <View className="flex-1 items-center justify-center px-5">
        <Text className="font-inter text-base text-sand-500 text-center">
          Macro adherence charts will appear{'\n'}after a few days of logging.
        </Text>
      </View>
    </SafeAreaView>
  );
}
