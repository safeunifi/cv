import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Dumbbell, Clock, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PlanSummary {
  id: string;
  title: string;
  description: string | null;
  daysPerWeek: number;
  isActive: boolean;
  createdAt: string;
  planType: string | null;
}

export default function WorkoutPlansScreen() {
  const { session } = useAuthStore();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, title, description, days_per_week, is_active, created_at, plan_type')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plans:', error);
      } else if (data) {
        setPlans(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            daysPerWeek: p.days_per_week,
            isActive: p.is_active,
            createdAt: p.created_at,
            planType: p.plan_type,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4A7C59" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-sand-900">Workout Plans</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50">
      <View className="flex-row items-center px-5 pt-4 gap-3 mb-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#4A7C59" />
        </Pressable>
        <Text className="font-inter-bold text-2xl text-sand-900">Workout Plans</Text>
      </View>

      {plans.length > 0 ? (
        <FlatList
          data={plans}
          contentContainerClassName="px-5 pb-6"
          renderItem={({ item }) => (
            <Card
              className="mb-3"
              onPress={() => router.push(`/(tabs)/fitness/workout-plans/${item.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-semibold text-base text-sand-800 flex-1">
                      {item.title}
                    </Text>
                    {item.isActive && (
                      <View className="bg-green-100 rounded-full px-2.5 py-0.5">
                        <Text className="font-inter-medium text-xs text-green-700">Active</Text>
                      </View>
                    )}
                  </View>
                  {item.description && (
                    <Text className="font-inter text-sm text-sand-500 mt-1" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-3 mt-2">
                    <View className="flex-row items-center gap-1">
                      <Dumbbell size={14} color="#9B917F" />
                      <Text className="font-inter text-xs text-sand-400">
                        {item.daysPerWeek} days/week
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Clock size={14} color="#9B917F" />
                      <Text className="font-inter text-xs text-sand-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color="#D5CFC3" />
              </View>
            </Card>
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <View className="mt-2">
              <Button
                title="Generate New Plan"
                onPress={() => router.push('/(tabs)/fitness/workout-plans/generate')}
                variant="outline"
              />
            </View>
          }
        />
      ) : (
        <View className="flex-1 px-5 items-center justify-center">
          <Dumbbell size={48} color="#D5CFC3" />
          <Text className="font-inter-semibold text-lg text-sand-700 mt-4">No Plans Yet</Text>
          <Text className="font-inter text-sm text-sand-500 mt-2 text-center">
            Generate a plan tailored to your goals,{'\n'}equipment, and schedule
          </Text>
          <View className="mt-6 w-full">
            <Button
              title="Generate Workout Plan"
              onPress={() => router.push('/(tabs)/fitness/workout-plans/generate')}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
