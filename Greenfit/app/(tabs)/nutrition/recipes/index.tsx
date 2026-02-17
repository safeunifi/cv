import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RecipesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Recipes</Text>
      </View>
      <View className="flex-1 px-5 items-center justify-center">
        <BookOpen size={48} color="#D5CFC3" />
        <Text className="font-inter-semibold text-lg text-sand-700 mt-4">Recipes Coming Soon</Text>
        <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
          A curated library of gluten-free, dairy-free{'\n'}whole food recipes is being prepared.
        </Text>
      </View>
    </SafeAreaView>
  );
}
