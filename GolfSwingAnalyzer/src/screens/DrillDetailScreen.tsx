import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Colors, difficultyColor } from '../utils/theme';
import { Drill, DrillCategoryIcons } from '../models/types';

export default function DrillDetailScreen() {
  const route = useRoute<any>();
  const { drill } = route.params as { drill: Drill };
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name={(DrillCategoryIcons[drill.category] || 'fitness') as any}
            size={32}
            color={Colors.primary}
          />
        </View>
        <View>
          <Text style={styles.category}>{drill.category}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: difficultyColor(drill.difficulty) + '22' }]}>
              <Text style={[styles.badgeText, { color: difficultyColor(drill.difficulty) }]}>
                {drill.difficulty}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{drill.description}</Text>

      {/* Equipment */}
      {drill.equipment.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct" size={16} color={Colors.text} />
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
          </View>
          <View style={styles.tagRow}>
            {drill.equipment.map((item, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Steps */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list-circle" size={16} color={Colors.text} />
          <Text style={styles.sectionTitle}>Steps</Text>
        </View>
        {drill.steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={styles.stepRow}
            onPress={() => toggleStep(index)}
          >
            <Ionicons
              name={completedSteps.has(index) ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={completedSteps.has(index) ? Colors.scoreExcellent : Colors.textSecondary}
            />
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Step {index + 1}</Text>
              <Text style={[
                styles.stepText,
                completedSteps.has(index) && styles.stepTextDone,
              ]}>
                {step}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {allComplete && (
          <View style={styles.completeBox}>
            <Ionicons name="checkmark-done-circle" size={20} color={Colors.scoreExcellent} />
            <Text style={styles.completeText}>All steps completed!</Text>
          </View>
        )}
      </View>

      {/* Reps */}
      <View style={styles.repsCard}>
        <Ionicons name="repeat" size={18} color={Colors.primary} />
        <View>
          <Text style={styles.repsLabel}>Recommended Reps</Text>
          <Text style={styles.repsValue}>{drill.reps}</Text>
        </View>
      </View>

      {/* Key Focus */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="locate" size={16} color={Colors.text} />
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
            <Ionicons name="flag" size={16} color={Colors.text} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(46,155,78,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: { color: Colors.primary, fontSize: 14 },
  badges: { flexDirection: 'row', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  description: { color: Colors.text, fontSize: 15, lineHeight: 22 },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  tagText: { color: Colors.text, fontSize: 12 },
  faultTag: { backgroundColor: 'rgba(255,159,10,0.12)' },
  faultTagText: { color: Colors.scoreFair, fontSize: 12, fontWeight: '500' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  stepContent: { flex: 1 },
  stepLabel: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  stepText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  stepTextDone: { color: Colors.textSecondary, textDecorationLine: 'line-through' },

  completeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'rgba(52,199,89,0.1)',
    borderRadius: 12,
  },
  completeText: { color: Colors.scoreExcellent, fontWeight: '600' },

  repsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  repsLabel: { color: Colors.textSecondary, fontSize: 11 },
  repsValue: { color: Colors.text, fontSize: 14, fontWeight: '600' },

  focusBox: {
    padding: 14,
    backgroundColor: 'rgba(46,155,78,0.06)',
    borderRadius: 12,
  },
  focusText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
});
