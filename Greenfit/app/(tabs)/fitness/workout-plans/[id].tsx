import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Dumbbell, ChevronDown, ChevronUp, Play } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useFitnessStore } from '@/stores/fitness-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GeneratedPlan } from '@/lib/fitness/generate-plan';
import type { WorkoutPlan, WorkoutPlanDay, WorkoutPlanExercise } from '@/types/fitness';

interface PlanWithDays extends WorkoutPlan {
  days: (WorkoutPlanDay & {
    exercises: (WorkoutPlanExercise & {
      exercise: { id: string; name: string; category: string; is_golf_specific: boolean } | null;
    })[];
  })[];
}

export default function WorkoutPlanDetailScreen() {
  const { id, planData } = useLocalSearchParams<{ id: string; planData?: string }>();
  const { session } = useAuthStore();
  const { setActivePlan, startWorkout } = useFitnessStore();
  const [plan, setPlan] = useState<PlanWithDays | null>(null);
  const [previewPlan, setPreviewPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // First day expanded

  useEffect(() => {
    if (id === 'preview' && planData) {
      // Guest mode: parse plan data from params
      try {
        const parsed = JSON.parse(planData) as GeneratedPlan;
        setPreviewPlan(parsed);
      } catch (e) {
        console.error('Error parsing plan data:', e);
      }
      setLoading(false);
    } else if (id && session?.user?.id) {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      // Fetch plan with nested days and exercises
      const { data: planRow, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError || !planRow) {
        console.error('Error fetching plan:', planError);
        setLoading(false);
        return;
      }

      const { data: days, error: daysError } = await supabase
        .from('workout_plan_days')
        .select('*')
        .eq('workout_plan_id', id)
        .order('sort_order');

      if (daysError) {
        console.error('Error fetching days:', daysError);
        setLoading(false);
        return;
      }

      // Fetch exercises for each day
      const daysWithExercises = await Promise.all(
        (days || []).map(async (day) => {
          const { data: exercises, error: exError } = await supabase
            .from('workout_plan_exercises')
            .select(`
              *,
              exercise:exercises(id, name, category, is_golf_specific)
            `)
            .eq('workout_plan_day_id', day.id)
            .order('sort_order');

          return {
            id: day.id,
            workoutPlanId: day.workout_plan_id,
            dayNumber: day.day_number,
            dayName: day.day_name,
            focus: day.focus,
            estimatedDurationMinutes: day.estimated_duration_minutes,
            sortOrder: day.sort_order,
            exercises: (exercises || []).map((ex: any) => ({
              id: ex.id,
              workoutPlanDayId: ex.workout_plan_day_id,
              exerciseId: ex.exercise_id,
              sets: ex.sets,
              repRange: ex.rep_range,
              restSeconds: ex.rest_seconds,
              tempo: ex.tempo,
              rpeTarget: ex.rpe_target,
              notes: ex.notes,
              supersetGroup: ex.superset_group,
              sortOrder: ex.sort_order,
              exercise: ex.exercise,
            })),
          };
        })
      );

      const mapped: PlanWithDays = {
        id: planRow.id,
        userId: planRow.user_id,
        title: planRow.title,
        description: planRow.description,
        daysPerWeek: planRow.days_per_week,
        durationWeeks: planRow.duration_weeks,
        planType: planRow.plan_type,
        equipmentTier: planRow.equipment_tier,
        fitnessGoals: planRow.fitness_goals || [],
        isActive: planRow.is_active,
        startDate: planRow.start_date,
        createdAt: planRow.created_at,
        days: daysWithExercises as any,
      };

      setPlan(mapped);
    } catch (err) {
      console.error('Error loading plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (index: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleStartWorkout = (day: any) => {
    const exercises = day.exercises.map((ex: any) => ({
      exerciseId: ex.exerciseId || ex.exerciseId,
      exerciseName: ex.exercise?.name || ex.exerciseName || 'Unknown',
      prescribedSets: ex.sets,
      prescribedReps: ex.repRange,
      restSeconds: ex.restSeconds,
      completedSets: [],
    }));

    startWorkout({
      workoutLogId: null,
      dayName: day.dayName,
      exercises,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
    });

    router.push('/(tabs)/fitness/log');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A7C59" />
          <Text className="font-inter text-base text-sand-400 mt-4">Loading plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render preview plan (guest mode) or fetched plan
  const isPreview = id === 'preview' && previewPlan;

  if (!plan && !previewPlan) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Workout Plan</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="font-inter text-base text-sand-400">Plan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Normalize the data for rendering
  const title = plan?.title || previewPlan?.title || 'Workout Plan';
  const description = plan?.description || previewPlan?.description || '';
  const daysPerWeek = plan?.daysPerWeek || previewPlan?.daysPerWeek || 0;
  const displayDays = plan?.days || (previewPlan?.days || []).map((d, i) => ({
    ...d,
    id: `preview-${i}`,
    workoutPlanId: 'preview',
    sortOrder: i,
    exercises: d.exercises.map((ex, j) => ({
      ...ex,
      id: `preview-ex-${i}-${j}`,
      workoutPlanDayId: `preview-${i}`,
      tempo: null,
      rpeTarget: null,
      supersetGroup: null,
      exercise: { id: ex.exerciseId, name: ex.exerciseName, category: '', is_golf_specific: false },
    })),
  }));

  const totalExercises = displayDays.reduce(
    (sum: number, day: any) => sum + day.exercises.length,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        {/* Header */}
        <View className="flex-row items-center pt-4 gap-3 mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <View className="flex-1">
            <Text className="font-inter-bold text-2xl text-sand-900">{title}</Text>
          </View>
        </View>

        {/* Plan Summary */}
        <Card className="mb-4">
          <Text className="font-inter text-sm text-sand-600 mb-3">{description}</Text>
          <View className="flex-row gap-4">
            <View className="flex-row items-center gap-1.5">
              <Dumbbell size={16} color="#4A7C59" />
              <Text className="font-inter-medium text-sm text-sand-700">
                {daysPerWeek} days/week
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Clock size={16} color="#4A7C59" />
              <Text className="font-inter-medium text-sm text-sand-700">
                {totalExercises} exercises
              </Text>
            </View>
          </View>
          {isPreview && (
            <View className="mt-3 bg-earth-100 rounded-lg p-2">
              <Text className="font-inter text-xs text-sand-500 text-center">
                Preview Mode — Sign in to save your plan
              </Text>
            </View>
          )}
        </Card>

        {/* Days */}
        {displayDays.map((day: any, index: number) => {
          const isExpanded = expandedDays.has(index);
          return (
            <Card key={day.id || index} className="mb-3">
              <Pressable
                onPress={() => toggleDay(index)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-full bg-green-500 items-center justify-center">
                      <Text className="font-inter-bold text-xs text-white">
                        {day.dayNumber || index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-semibold text-base text-sand-800">
                        {day.dayName}
                      </Text>
                      <Text className="font-inter text-xs text-sand-400">
                        {day.focus} · {day.exercises?.length || 0} exercises
                        {day.estimatedDurationMinutes
                          ? ` · ~${day.estimatedDurationMinutes} min`
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color="#9B917F" />
                ) : (
                  <ChevronDown size={20} color="#9B917F" />
                )}
              </Pressable>

              {isExpanded && (
                <View className="mt-3 pt-3 border-t border-earth-200">
                  {(day.exercises || []).map((ex: any, exIndex: number) => (
                    <View
                      key={ex.id || exIndex}
                      className={`py-2.5 ${
                        exIndex < day.exercises.length - 1 ? 'border-b border-earth-100' : ''
                      }`}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                          <Text className="font-inter-medium text-sm text-sand-800">
                            {ex.exercise?.name || ex.exerciseName || 'Exercise'}
                          </Text>
                          {ex.notes && (
                            <Text className="font-inter text-xs text-sand-400 mt-0.5">
                              {ex.notes}
                            </Text>
                          )}
                        </View>
                        <View className="items-end">
                          <Text className="font-inter-semibold text-sm text-green-600">
                            {ex.sets} × {ex.repRange}
                          </Text>
                          <Text className="font-inter text-xs text-sand-400">
                            {ex.restSeconds}s rest
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* Start Workout button for this day */}
                  <View className="mt-3">
                    <Button
                      title="Start Workout"
                      onPress={() => handleStartWorkout(day)}
                      variant="outline"
                      size="sm"
                      icon={<Play size={16} color="#4A7C59" />}
                    />
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {/* Generate New Plan button */}
        <View className="mt-4">
          <Button
            title="Generate New Plan"
            onPress={() => router.push('/(tabs)/fitness/workout-plans/generate')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
