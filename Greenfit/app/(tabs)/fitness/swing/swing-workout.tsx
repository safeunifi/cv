import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Clock, Dumbbell, Flame, Snowflake, Play, CheckCircle2 } from 'lucide-react-native';
import { GolfColors, severityColor } from '@/constants/golf-theme';
import { useSwingStore } from '@/stores/swing-store';
import { useAuthStore } from '@/stores/auth-store';
import { useFitnessStore } from '@/stores/fitness-store';
import { generateSwingWorkout } from '@/lib/golf/swing-workout';
import { FALLBACK_GOLF_EXERCISES } from '@/lib/golf/fallback-exercises';
import type { SwingWorkoutPlan, SwingWorkoutExercise } from '@/lib/golf/swing-workout';

export default function SwingWorkoutScreen() {
  const { currentAnalysis } = useSwingStore();
  const profile = useAuthStore((s) => s.profile);
  const { exercises, fetchExercises, startWorkout } = useFitnessStore();
  const [plan, setPlan] = useState<SwingWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Try to load from Supabase but don't block on it
    fetchExercises().catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentAnalysis) return;

    // Use Supabase exercises if available, otherwise fall back to built-in library
    const exercisePool = exercises.length > 0 ? exercises : FALLBACK_GOLF_EXERCISES;
    const injuryAreas = profile?.injuryAreas || [];
    const equipmentTier = profile?.equipmentTier || 'none';

    // Filter fallback exercises for injury contraindications
    const filteredPool = exercisePool.filter(
      (ex) => !injuryAreas.some((area) => ex.contraindicatedAreas.includes(area))
    );

    const workout = generateSwingWorkout(
      currentAnalysis,
      filteredPool,
      equipmentTier,
      injuryAreas
    );
    setPlan(workout);
    setLoading(false);
  }, [currentAnalysis, exercises]);

  const handleStartWorkout = () => {
    if (!plan) return;

    const allExercises = [...plan.warmup, ...plan.main, ...plan.cooldown];
    startWorkout({
      workoutLogId: null,
      dayName: plan.title,
      exercises: allExercises.map((item) => ({
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        prescribedSets: item.sets,
        prescribedReps: item.repRange,
        restSeconds: item.restSeconds,
        completedSets: [],
      })),
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
    });

    router.push('/(tabs)/fitness/log/index');
  };

  const toggleComplete = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

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

  const allCount = plan.warmup.length + plan.main.length + plan.cooldown.length;
  const doneCount = completedExercises.size;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
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
          <Text style={styles.statValue}>{allCount} exercises</Text>
        </View>
        {doneCount > 0 && (
          <View style={styles.stat}>
            <CheckCircle2 size={16} color={GolfColors.scoreExcellent} />
            <Text style={[styles.statValue, { color: GolfColors.scoreExcellent }]}>
              {doneCount}/{allCount} done
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      {allCount > 0 && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(doneCount / allCount) * 100}%` }]} />
        </View>
      )}

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

      {/* Start Workout Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
        <Play size={20} color="#fff" fill="#fff" />
        <Text style={styles.startButtonText}>Start Workout Session</Text>
      </TouchableOpacity>

      {/* Warmup */}
      <SectionHeader icon={<Flame size={18} color="#E67E22" />} title="Warmup" color="#E67E22" />
      {plan.warmup.map((ex, i) => (
        <ExerciseCard
          key={ex.exercise.id + i}
          item={ex}
          index={i + 1}
          done={completedExercises.has(ex.exercise.id + '-warmup')}
          onToggle={() => toggleComplete(ex.exercise.id + '-warmup')}
        />
      ))}

      {/* Main */}
      <SectionHeader icon={<Dumbbell size={18} color={GolfColors.primary} />} title="Swing Fix Exercises" color={GolfColors.primary} />
      {plan.main.map((ex, i) => (
        <ExerciseCard
          key={ex.exercise.id + i}
          item={ex}
          index={i + 1}
          done={completedExercises.has(ex.exercise.id + '-main')}
          onToggle={() => toggleComplete(ex.exercise.id + '-main')}
        />
      ))}

      {/* Cooldown */}
      <SectionHeader icon={<Snowflake size={18} color="#3498DB" />} title="Cooldown" color="#3498DB" />
      {plan.cooldown.map((ex, i) => (
        <ExerciseCard
          key={ex.exercise.id + i}
          item={ex}
          index={i + 1}
          done={completedExercises.has(ex.exercise.id + '-cool')}
          onToggle={() => toggleComplete(ex.exercise.id + '-cool')}
        />
      ))}

      {/* Finish banner */}
      {doneCount === allCount && allCount > 0 && (
        <View style={styles.finishBanner}>
          <CheckCircle2 size={24} color={GolfColors.scoreExcellent} />
          <Text style={styles.finishText}>Workout Complete! Great work.</Text>
        </View>
      )}

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

function ExerciseCard({
  item,
  index,
  done,
  onToggle,
}: {
  item: SwingWorkoutExercise;
  index: number;
  done: boolean;
  onToggle: () => void;
}) {
  const ex = item.exercise;
  return (
    <TouchableOpacity
      style={[styles.exerciseCard, done && styles.exerciseCardDone]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.exerciseIndex, done && styles.exerciseIndexDone]}>
        {done
          ? <CheckCircle2 size={18} color="#fff" />
          : <Text style={styles.exerciseIndexText}>{index}</Text>
        }
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, done && styles.textDone]}>{ex.name}</Text>
        <Text style={styles.exerciseMeta}>
          {item.sets} sets · {item.repRange} · {item.restSeconds}s rest
        </Text>
        <Text style={styles.exerciseReason}>{item.reason}</Text>
        {ex.golfBenefit && (
          <Text style={styles.golfBenefit}>{ex.golfBenefit}</Text>
        )}
        {ex.equipmentNeeded.length > 0 && (
          <Text style={styles.equipment}>Equipment: {ex.equipmentNeeded.join(', ')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  content: { padding: 16, gap: 12 },

  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backText: { fontSize: 16, color: GolfColors.text, fontWeight: '500' },

  title: { fontSize: 22, fontWeight: '700', color: GolfColors.text },
  description: { fontSize: 14, color: GolfColors.textSecondary, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: 20, paddingVertical: 4, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 14, fontWeight: '600', color: GolfColors.text },

  progressBarBg: { height: 6, backgroundColor: GolfColors.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: GolfColors.scoreExcellent, borderRadius: 3 },

  faultTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  faultTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  faultTagText: { fontSize: 12, fontWeight: '600' },

  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: GolfColors.primary, borderRadius: 14, paddingVertical: 14,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

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
  exerciseCardDone: {
    backgroundColor: 'rgba(23,184,94,0.06)',
    borderColor: GolfColors.scoreExcellent + '44',
  },
  exerciseIndex: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GolfColors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  exerciseIndexDone: { backgroundColor: GolfColors.scoreExcellent },
  exerciseIndexText: { fontSize: 14, fontWeight: '700', color: GolfColors.primary },
  exerciseInfo: { flex: 1, gap: 4 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: GolfColors.text },
  textDone: { color: GolfColors.textSecondary, textDecorationLine: 'line-through' },
  exerciseMeta: { fontSize: 13, color: GolfColors.primary, fontWeight: '500' },
  exerciseReason: { fontSize: 12, color: GolfColors.textSecondary, lineHeight: 17 },
  golfBenefit: { fontSize: 12, color: GolfColors.scoreGood, fontStyle: 'italic' },
  equipment: { fontSize: 11, color: GolfColors.textSecondary },

  finishBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(23,184,94,0.1)', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: GolfColors.scoreExcellent + '44',
  },
  finishText: { fontSize: 16, fontWeight: '700', color: GolfColors.scoreExcellent },
});
