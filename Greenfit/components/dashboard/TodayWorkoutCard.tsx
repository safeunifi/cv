import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dumbbell, Clock } from 'lucide-react-native';

interface TodayWorkoutCardProps {
  dayName?: string;
  exerciseCount?: number;
  estimatedMinutes?: number;
  onStartWorkout: () => void;
  hasActivePlan: boolean;
}

export function TodayWorkoutCard({
  dayName,
  exerciseCount,
  estimatedMinutes,
  onStartWorkout,
  hasActivePlan,
}: TodayWorkoutCardProps) {
  if (!hasActivePlan) {
    return (
      <Card>
        <View className="items-center py-4">
          <Dumbbell size={32} color="#B8B0A1" />
          <Text className="font-inter-semibold text-base text-sand-700 mt-3">
            No Workout Plan Yet
          </Text>
          <Text className="font-inter text-sm text-sand-500 mt-1 text-center">
            Generate a personalized workout plan{'\n'}based on your goals and equipment
          </Text>
          <View className="mt-4 w-full">
            <Button
              title="Generate Workout Plan"
              onPress={onStartWorkout}
              variant="outline"
              size="sm"
            />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Text className="font-inter-semibold text-lg text-sand-800 mb-1">Today's Workout</Text>
      <Text className="font-inter text-sm text-green-600 mb-3">{dayName || 'Rest Day'}</Text>

      {dayName && (
        <>
          <View className="flex-row gap-4 mb-4">
            <View className="flex-row items-center gap-1">
              <Dumbbell size={14} color="#9B917F" />
              <Text className="font-inter text-sm text-sand-600">
                {exerciseCount} exercises
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={14} color="#9B917F" />
              <Text className="font-inter text-sm text-sand-600">
                ~{estimatedMinutes} min
              </Text>
            </View>
          </View>
          <Button title="Start Workout" onPress={onStartWorkout} size="sm" />
        </>
      )}
    </Card>
  );
}
