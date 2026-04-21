import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Dumbbell, ListChecks, Clock, Library, Video } from 'lucide-react-native';
import { useFitnessStore } from '@/stores/fitness-store';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FitnessScreen() {
  const { activePlan } = useFitnessStore();
  const profile = useAuthStore((s) => s.profile);
  const showGolf = profile?.golfExperience && profile.golfExperience !== 'none';

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-4 pb-4">
          <Text className="font-inter-bold text-2xl text-sand-900">Fitness</Text>
        </View>

        {/* Swing Analysis Card - shown when golf experience is set */}
        {showGolf && (
          <Card
            onPress={() => router.push('/(tabs)/fitness/swing')}
            className="mb-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-2xl bg-green-500 items-center justify-center">
                <Video size={28} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-lg text-sand-900">
                  Swing Analysis
                </Text>
                <Text className="font-inter text-sm text-sand-500 mt-0.5">
                  Record, analyze & improve your golf swing
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Active Plan or Generate */}
        {activePlan ? (
          <Card className="mb-4">
            <Text className="font-inter-semibold text-lg text-sand-800 mb-1">
              {activePlan.title}
            </Text>
            <Text className="font-inter text-sm text-sand-500 mb-3">
              {activePlan.daysPerWeek} days/week · {activePlan.durationWeeks} weeks
            </Text>
            <Button
              title="Start Today's Workout"
              onPress={() => router.push('/(tabs)/fitness/log')}
              size="sm"
            />
          </Card>
        ) : (
          <Card className="mb-4">
            <View className="items-center py-4">
              <Dumbbell size={40} color="#B8B0A1" />
              <Text className="font-inter-semibold text-lg text-sand-700 mt-3">
                Ready to Train?
              </Text>
              <Text className="font-inter text-sm text-sand-500 mt-1 text-center">
                Generate a personalized plan based on{'\n'}your equipment and goals
              </Text>
              <View className="mt-4 w-full">
                <Button
                  title="Generate Workout Plan"
                  onPress={() => router.push('/(tabs)/fitness/workout-plans/generate')}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Quick Links */}
        <Text className="font-inter-semibold text-base text-sand-700 mb-3">Quick Access</Text>
        <View className="gap-3">
          <Card
            onPress={() => router.push('/(tabs)/fitness/exercises')}
            padding="md"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                <Library size={20} color="#4A7C59" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-sand-800">Exercise Library</Text>
                <Text className="font-inter text-sm text-sand-500">
                  Browse strength, mobility & golf exercises
                </Text>
              </View>
            </View>
          </Card>

          <Card
            onPress={() => router.push('/(tabs)/fitness/workout-plans')}
            padding="md"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-earth-50 items-center justify-center">
                <ListChecks size={20} color="#A68B5B" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-sand-800">Workout Plans</Text>
                <Text className="font-inter text-sm text-sand-500">
                  View and manage your training plans
                </Text>
              </View>
            </View>
          </Card>

          <Card
            onPress={() => router.push('/(tabs)/fitness/history')}
            padding="md"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-fairway-50 items-center justify-center">
                <Clock size={20} color="#0D9148" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-sand-800">Workout History</Text>
                <Text className="font-inter text-sm text-sand-500">
                  View past workouts and track progress
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
