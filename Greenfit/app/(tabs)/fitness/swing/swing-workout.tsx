import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Clock, Dumbbell, Flame, Snowflake, Play } from 'lucide-react-native';
import { GolfColors, severityColor } from '@/constants/golf-theme';
import { useSwingStore } from '@/stores/swing-store';
import { useAuthStore } from '@/stores/auth-store';
import { useFitnessStore } from '@/stores/fitness-store';
import { generateSwingWorkout } from '@/lib/golf/swing-workout';
import type { SwingWorkoutPlan, SwingWorkoutExercise } from '@/lib/golf/swing-workout';

export default function SwingWorkoutScreen() {
  const { currentAnalysis } = useSwingStore();
  const profile = useAuthStore((s) => s.profile);
  const { exercises, fetchExercises } = useFitnessStore();
  const [plan, setPlan] = useState<SwingWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Ensure exercises are loaded from Supabase
      if (exercises.length === 0) {
        await fetchExercises();
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!currentAnalysis || exercises.length === 0) return;

    const workout = generateSwingWorkout(
      currentAnalysis,
      exercises,
      profile?.equipmentTier || 'none',
      profile?.injuryAreas || []
    );
    setPlan(workout);
    setLoading(false);
  }, [currentAnalysis, exercises]);

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: GolfColors.textSecondary }}>
          Run a swing analysis first to get a targeted workout.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GolfColors.primary} />
        <Text style={{ color: GolfColors.textSecondary, marginTop: 12 }}>
          Building your swing fix workout...
        </Text>
      </View>
    );
  }

  if (!plan) return null;

  const faultNames = currentAnalysis.faults.map((f) => f.name);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={GolfColors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{plan.title}</Text>
      <Text style={styles.description}>{plan.description}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Clock size={16} color={GolfColors.primary} />
          <Text style={styles.statValue}>{plan.estimatedMinutes} min</Text>
        </View>
        <View style={styles.stat}>
          <Dumbbell size={16} color={GolfColors.primary} />
          <Text style={styles.statValue}>{plan.warmup.length + plan.main.length + plan.cooldown.length} exercises</Text>
        </View>
      </View>

      {/* Targeted faults */}
      <View style={styles.faultTags}>
        {currentAnalysis.faults.map((fault) => (
          <View key={fault.id} style={[styles.faultTag, { backgroundColor: severityColor(fault.severity) + '18' }]}>
            <Text style={[styles.faultTagText, { color: severityColor(fault.severity) }]}>
              {fault.name} ({fault.severity})
            </Text>
          </View>
        ))}
      </View>

      {/* Warmup Section */}
      <SectionHeader icon={<Flame size={18} color="#E67E22" />} title="Warmup" color="#E67E22" />
      {plan.warmup.map((ex, i) => (
        <ExerciseCard key={ex.exercise.id + i} item={ex} index={i + 1} />
      ))}

      {/* Main Workout */}
      <SectionHeader icon={<Dumbbell size={18} color={GolfColors.primary} />} title="Swing Fix Exercises" color={GolfColors.primary} />
      {plan.main.map((ex, i) => (
        <ExerciseCard key={ex.exercise.id + i} item={ex} index={i + 1} />
      ))}

      {/* Cooldown */}
      <SectionHeader icon={<Snowflake size={18} color="#3498DB" />} title="Cooldown" color="#3498DB" />
      {plan.cooldown.map((ex, i) => (
        <ExerciseCard key={ex.exercise.id + i} item={ex} index={i + 1} />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ExerciseCard({ item, index }: { item: SwingWorkoutExercise; index: number }) {
  const ex = item.exercise;
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseIndex}>
        <Text style={styles.exerciseIndexText}>{index}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{ex.name}</Text>
        <Text style={styles.exerciseMeta}>
          {item.sets} sets · {item.repRange} · {item.restSeconds}s rest
        </Text>
        <Text style={styles.exerciseReason}>{item.reason}</Text>
        {ex.golfBenefit && (
          <Text style={styles.golfBenefit}>{ex.golfBenefit}</Text>
        )}
        {ex.equipmentNeeded.length > 0 && (
          <Text style={styles.equipment}>
            Equipment: {ex.equipmentNeeded.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  content: { padding: 16, gap: 12 },

  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backText: { fontSize: 16, color: GolfColors.text, fontWeight: '500' },

  title: { fontSize: 22, fontWeight: '700', color: GolfColors.text },
  description: { fontSize: 14, color: GolfColors.textSecondary, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: 20, paddingVertical: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 14, fontWeight: '600', color: GolfColors.text },

  faultTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  faultTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  faultTagText: { fontSize: 12, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, paddingLeft: 10, borderLeftWidth: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: GolfColors.text },

  exerciseCard: {
    flexDirection: 'row', backgroundColor: GolfColors.surface,
    borderRadius: 12, padding: 14, gap: 12,
    borderWidth: 1, borderColor: GolfColors.border,
  },
  exerciseIndex: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GolfColors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  exerciseIndexText: { fontSize: 14, fontWeight: '700', color: GolfColors.primary },
  exerciseInfo: { flex: 1, gap: 4 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: GolfColors.text },
  exerciseMeta: { fontSize: 13, color: GolfColors.primary, fontWeight: '500' },
  exerciseReason: { fontSize: 12, color: GolfColors.textSecondary, lineHeight: 17 },
  golfBenefit: { fontSize: 12, color: GolfColors.scoreGood, fontStyle: 'italic' },
  equipment: { fontSize: 11, color: GolfColors.textSecondary },
});
