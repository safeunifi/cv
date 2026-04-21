import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { useFitnessStore } from '@/stores/fitness-store';
import { Card } from '@/components/ui/Card';
import * as WebBrowser from 'expo-web-browser';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { exercises } = useFitnessStore();
  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
        <Text className="font-inter text-base text-sand-500">Exercise not found</Text>
      </SafeAreaView>
    );
  }

  const openVideo = () => {
    if (exercise.videoUrl) {
      WebBrowser.openBrowserAsync(exercise.videoUrl);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6">
        {/* Header */}
        <View className="flex-row items-center pt-4 gap-3 mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900 flex-1" numberOfLines={2}>
            {exercise.name}
          </Text>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <Text className="font-inter text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full">
            {exercise.category}
          </Text>
          <Text className="font-inter text-xs text-sand-600 bg-earth-100 px-3 py-1 rounded-full">
            {exercise.difficulty}
          </Text>
          <Text className="font-inter text-xs text-sand-600 bg-earth-100 px-3 py-1 rounded-full">
            {exercise.equipmentTier}
          </Text>
          {exercise.isGolfSpecific && (
            <Text className="font-inter text-xs text-earth-600 bg-earth-100 px-3 py-1 rounded-full">
              Golf Specific
            </Text>
          )}
        </View>

        {/* Video */}
        {exercise.videoUrl && (
          <Pressable
            onPress={openVideo}
            className="bg-green-50 border border-green-200 rounded-xl py-4 items-center mb-4 flex-row justify-center gap-2"
          >
            <ExternalLink size={18} color="#4A7C59" />
            <Text className="font-inter-semibold text-base text-green-700">Watch Video Demo</Text>
          </Pressable>
        )}

        {/* Description */}
        {exercise.description && (
          <Card className="mb-4">
            <Text className="font-inter-semibold text-base text-sand-800 mb-2">Instructions</Text>
            <Text className="font-inter text-sm text-sand-600 leading-5">
              {exercise.description}
            </Text>
          </Card>
        )}

        {/* Muscle Groups */}
        {exercise.muscleGroups.length > 0 && (
          <Card className="mb-4">
            <Text className="font-inter-semibold text-base text-sand-800 mb-2">Muscle Groups</Text>
            <View className="flex-row flex-wrap gap-2">
              {exercise.muscleGroups.map((mg) => (
                <Text key={mg} className="font-inter text-xs text-sand-600 bg-sand-100 px-3 py-1 rounded-full">
                  {mg.replace('_', ' ')}
                </Text>
              ))}
            </View>
          </Card>
        )}

        {/* Golf Benefit */}
        {exercise.golfBenefit && (
          <Card className="mb-4">
            <Text className="font-inter-semibold text-base text-sand-800 mb-2">Golf Benefit</Text>
            <Text className="font-inter text-sm text-sand-600">{exercise.golfBenefit}</Text>
          </Card>
        )}

        {/* Equipment */}
        {exercise.equipmentNeeded.length > 0 && (
          <Card className="mb-4">
            <Text className="font-inter-semibold text-base text-sand-800 mb-2">Equipment Needed</Text>
            <View className="flex-row flex-wrap gap-2">
              {exercise.equipmentNeeded.map((eq) => (
                <Text key={eq} className="font-inter text-xs text-sand-600 bg-sand-100 px-3 py-1 rounded-full">
                  {eq}
                </Text>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
