import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Wrench, ListOrdered, CheckCircle2, Circle, Repeat, Crosshair, Flag, Dumbbell, CheckCheck } from 'lucide-react-native';
import { GolfColors, difficultyColor } from '@/constants/golf-theme';
import { getDrillById } from '@/data/drills';

export default function DrillDetailScreen() {
  const { drillId } = useLocalSearchParams<{ drillId: string }>();
  const drill = getDrillById(drillId ?? '');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (!drill) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: GolfColors.textSecondary }}>Drill not found</Text>
      </View>
    );
  }

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const allComplete = completedSteps.size === drill.steps.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={GolfColors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Dumbbell size={32} color={GolfColors.primary} />
        </View>
        <View>
          <Text style={styles.category}>{drill.category}</Text>
          <Text style={styles.drillTitle}>{drill.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: difficultyColor(drill.difficulty) + '22' }]}>
              <Text style={[styles.badgeText, { color: difficultyColor(drill.difficulty) }]}>{drill.difficulty}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{drill.description}</Text>

      {/* Equipment */}
      {drill.equipment.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wrench size={16} color={GolfColors.text} />
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
          </View>
          <View style={styles.tagRow}>
            {drill.equipment.map((item, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{item}</Text></View>
            ))}
          </View>
        </View>
      )}

      {/* Steps */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ListOrdered size={16} color={GolfColors.text} />
          <Text style={styles.sectionTitle}>Steps</Text>
        </View>
        {drill.steps.map((step, index) => (
          <TouchableOpacity key={index} style={styles.stepRow} onPress={() => toggleStep(index)}>
            {completedSteps.has(index)
              ? <CheckCircle2 size={22} color={GolfColors.scoreExcellent} />
              : <Circle size={22} color={GolfColors.textSecondary} />
            }
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Step {index + 1}</Text>
              <Text style={[styles.stepText, completedSteps.has(index) && styles.stepTextDone]}>{step}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {allComplete && (
          <View style={styles.completeBox}>
            <CheckCheck size={20} color={GolfColors.scoreExcellent} />
            <Text style={styles.completeText}>All steps completed!</Text>
          </View>
        )}
      </View>

      {/* Reps */}
      <View style={styles.repsCard}>
        <Repeat size={18} color={GolfColors.primary} />
        <View>
          <Text style={styles.repsLabel}>Recommended Reps</Text>
          <Text style={styles.repsValue}>{drill.reps}</Text>
        </View>
      </View>

      {/* Key Focus */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Crosshair size={16} color={GolfColors.text} />
          <Text style={styles.sectionTitle}>Key Focus</Text>
        </View>
        <View style={styles.focusBox}>
          <Text style={styles.focusText}>{drill.keyFocus}</Text>
        </View>
      </View>

      {/* Target Faults */}
      {drill.targetFaults.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Flag size={16} color={GolfColors.text} />
            <Text style={styles.sectionTitle}>Targets These Faults</Text>
          </View>
          <View style={styles.tagRow}>
            {drill.targetFaults.map((fault, i) => (
              <View key={i} style={[styles.tag, styles.faultTag]}>
                <Text style={styles.faultTagText}>{fault}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  content: { padding: 16, gap: 20 },

  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 44 },
  backText: { fontSize: 16, color: GolfColors.text, fontWeight: '500' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(74,124,89,0.1)', justifyContent: 'center', alignItems: 'center' },
  category: { color: GolfColors.primary, fontSize: 14 },
  drillTitle: { color: GolfColors.text, fontSize: 18, fontWeight: '700', marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  description: { color: GolfColors.text, fontSize: 15, lineHeight: 22 },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: GolfColors.text, fontSize: 16, fontWeight: '700' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: GolfColors.surface, borderRadius: 16, borderWidth: 1, borderColor: GolfColors.border },
  tagText: { color: GolfColors.text, fontSize: 12 },
  faultTag: { backgroundColor: 'rgba(255,159,10,0.12)', borderColor: 'rgba(255,159,10,0.2)' },
  faultTagText: { color: GolfColors.scoreFair, fontSize: 12, fontWeight: '500' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  stepContent: { flex: 1 },
  stepLabel: { color: GolfColors.primary, fontSize: 12, fontWeight: '600' },
  stepText: { color: GolfColors.text, fontSize: 14, lineHeight: 20 },
  stepTextDone: { color: GolfColors.textSecondary, textDecorationLine: 'line-through' },

  completeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: 'rgba(23,184,94,0.1)', borderRadius: 12 },
  completeText: { color: GolfColors.scoreExcellent, fontWeight: '600' },

  repsCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: GolfColors.surface, borderRadius: 12, borderWidth: 1, borderColor: GolfColors.border },
  repsLabel: { color: GolfColors.textSecondary, fontSize: 11 },
  repsValue: { color: GolfColors.text, fontSize: 14, fontWeight: '600' },

  focusBox: { padding: 14, backgroundColor: 'rgba(74,124,89,0.06)', borderRadius: 12 },
  focusText: { color: GolfColors.text, fontSize: 14, lineHeight: 20 },
});
