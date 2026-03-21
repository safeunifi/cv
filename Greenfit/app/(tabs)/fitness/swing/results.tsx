import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Gauge, BarChart3, AlertTriangle, Star, Target, ChevronUp, ChevronDown, ChevronLeft, ArrowRight, ArrowRightCircle, CheckCircle2, Lightbulb, Dumbbell, ChevronRight, Bot } from 'lucide-react-native';
import { GolfColors, scoreColor, severityColor, difficultyColor } from '@/constants/golf-theme';
import { SWING_PHASES, SwingPhaseLabels } from '@/types/golf';
import type { PhaseAnalysis, SwingFault } from '@/types/golf';
import { scoreGrade, tempoAssessment } from '@/lib/golf/swing-analyzer';
import { getDrillById } from '@/data/drills';
import { useSwingStore } from '@/stores/swing-store';

export default function SwingResultsScreen() {
  const { currentAnalysis } = useSwingStore();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: GolfColors.textSecondary }}>No analysis data available</Text>
      </View>
    );
  }

  const analysis = currentAnalysis;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={GolfColors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Score Circle */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor(analysis.overallScore) }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor(analysis.overallScore) }]}>{analysis.overallScore}</Text>
          <Text style={styles.scoreLabel}>{scoreGrade(analysis.overallScore)}</Text>
        </View>
      </View>

      {/* Tempo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Gauge size={18} color={GolfColors.text} />
          <Text style={styles.cardTitle}>Swing Tempo</Text>
        </View>
        <View style={styles.tempoRow}>
          <View style={styles.tempoItem}>
            <Text style={styles.tempoValue}>{analysis.tempo.backswingDuration.toFixed(1)}s</Text>
            <Text style={styles.tempoLabel}>Backswing</Text>
          </View>
          <ArrowRight size={16} color={GolfColors.textSecondary} />
          <View style={styles.tempoItem}>
            <Text style={styles.tempoValue}>{analysis.tempo.downswingDuration.toFixed(1)}s</Text>
            <Text style={styles.tempoLabel}>Downswing</Text>
          </View>
          <View style={styles.tempoItem}>
            <Text style={[styles.tempoRatio, {
              color: analysis.tempo.ratio >= 2.5 && analysis.tempo.ratio <= 3.5 ? GolfColors.scoreExcellent : GolfColors.scoreFair
            }]}>{analysis.tempo.ratio.toFixed(1)}:1</Text>
            <Text style={styles.tempoLabel}>Ratio</Text>
          </View>
        </View>
        <Text style={styles.tempoAssessment}>{tempoAssessment(analysis.tempo.ratio)}</Text>
      </View>

      {/* Phase Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <BarChart3 size={18} color={GolfColors.text} />
          <Text style={styles.cardTitle}>Phase Breakdown</Text>
        </View>
        {SWING_PHASES.map((phase) => {
          const data = analysis.phases[phase];
          if (!data) return null;
          return (
            <PhaseRow
              key={phase}
              label={SwingPhaseLabels[phase]}
              data={data}
              isExpanded={expandedPhase === phase}
              onPress={() => setExpandedPhase(expandedPhase === phase ? null : phase)}
            />
          );
        })}
      </View>

      {/* Faults */}
      {analysis.faults.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AlertTriangle size={18} color={GolfColors.scoreFair} />
            <Text style={styles.cardTitle}>Swing Faults</Text>
          </View>
          {analysis.faults.map((fault) => <FaultCard key={fault.id} fault={fault} />)}
        </View>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <View style={[styles.card, { backgroundColor: 'rgba(23,184,94,0.06)' }]}>
          <View style={styles.cardHeader}>
            <Star size={18} color={GolfColors.scoreExcellent} />
            <Text style={styles.cardTitle}>Strengths</Text>
          </View>
          {analysis.strengths.map((s, i) => (
            <View key={i} style={styles.strengthRow}>
              <CheckCircle2 size={16} color={GolfColors.scoreExcellent} />
              <Text style={styles.strengthText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Fix Your Swing Workout */}
      {analysis.faults.length > 0 && (
        <TouchableOpacity
          style={styles.workoutCta}
          onPress={() => router.push('/(tabs)/fitness/swing/swing-workout')}
        >
          <View style={styles.workoutCtaIcon}>
            <Dumbbell size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workoutCtaTitle}>Fix Your Swing Workout</Text>
            <Text style={styles.workoutCtaSubtitle}>
              Targeted exercises for your {analysis.faults.length} detected fault{analysis.faults.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* NemoClaw AI Coach */}
      <TouchableOpacity
        style={styles.aiCoachCta}
        onPress={() => router.push('/(tabs)/fitness/swing/ai-coach')}
      >
        <View style={styles.aiCoachIcon}>
          <Bot size={24} color={GolfColors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiCoachTitle}>Ask Your AI Coach</Text>
          <Text style={styles.aiCoachSubtitle}>
            NemoClaw AI — personalized coaching from your swing data
          </Text>
        </View>
        <ChevronRight size={20} color={GolfColors.primary} />
      </TouchableOpacity>

      {/* Recommended Drills */}
      {analysis.recommendations.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Target size={18} color={GolfColors.text} />
            <Text style={styles.cardTitle}>Recommended Drills</Text>
          </View>
          {analysis.recommendations.map((rec) => {
            const drill = getDrillById(rec.drillId);
            if (!drill) return null;
            return (
              <TouchableOpacity
                key={rec.id}
                style={styles.drillRecommendation}
                onPress={() => router.push({ pathname: '/(tabs)/fitness/swing/drill-detail', params: { drillId: drill.id } })}
              >
                <View style={styles.drillIcon}>
                  <Dumbbell size={22} color={GolfColors.primary} />
                </View>
                <View style={styles.drillInfo}>
                  <Text style={styles.drillName}>{drill.name}</Text>
                  <Text style={styles.drillReason}>{rec.reason}</Text>
                  <Text style={[styles.drillDifficulty, { color: difficultyColor(drill.difficulty) }]}>{drill.difficulty}</Text>
                </View>
                <ChevronRight size={16} color={GolfColors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function PhaseRow({ label, data, isExpanded, onPress }: { label: string; data: PhaseAnalysis; isExpanded: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.phaseRow} onPress={onPress}>
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseName}>{label}</Text>
        <Text style={[styles.phaseScore, { color: scoreColor(data.score) }]}>{data.score}</Text>
        <View style={styles.phaseBar}>
          <View style={styles.phaseBarBg} />
          <View style={[styles.phaseBarFill, { width: `${data.score}%`, backgroundColor: scoreColor(data.score) }]} />
        </View>
        {isExpanded ? <ChevronUp size={14} color={GolfColors.textSecondary} /> : <ChevronDown size={14} color={GolfColors.textSecondary} />}
      </View>

      {isExpanded && (
        <View style={styles.phaseDetails}>
          {Object.entries(data.keyAngles).sort().map(([name, value]) => (
            <View key={name} style={styles.angleRow}>
              <Text style={styles.angleName}>{name}</Text>
              <Text style={styles.angleValue}>{Math.round(value)}\u00B0</Text>
            </View>
          ))}
          {data.observations.map((obs, i) => (
            <View key={i} style={styles.observationRow}>
              <ArrowRightCircle size={12} color={GolfColors.primary} />
              <Text style={styles.observationText}>{obs}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

function FaultCard({ fault }: { fault: SwingFault }) {
  const sColor = severityColor(fault.severity);
  return (
    <View style={[styles.faultCard, { borderLeftColor: sColor }]}>
      <View style={styles.faultHeader}>
        <Text style={styles.faultName}>{fault.name}</Text>
        <View style={[styles.severityBadge, { backgroundColor: sColor + '22' }]}>
          <Text style={[styles.severityText, { color: sColor }]}>{fault.severity}</Text>
        </View>
      </View>
      <Text style={styles.faultDescription}>{fault.description}</Text>
      <View style={styles.correctionBox}>
        <Lightbulb size={14} color={GolfColors.scoreGood} />
        <Text style={styles.correctionText}>{fault.correction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  content: { padding: 16, gap: 16 },

  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backText: { fontSize: 16, color: GolfColors.text, fontWeight: '500' },

  scoreSection: { alignItems: 'center', paddingVertical: 8 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
  scoreNumber: { fontSize: 44, fontWeight: '700' },
  scoreLabel: { color: GolfColors.textSecondary, fontSize: 13 },

  card: { backgroundColor: GolfColors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: GolfColors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: GolfColors.text, fontSize: 16, fontWeight: '700' },

  tempoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tempoItem: { alignItems: 'center' },
  tempoValue: { color: GolfColors.text, fontSize: 18, fontWeight: '700' },
  tempoLabel: { color: GolfColors.textSecondary, fontSize: 11, marginTop: 2 },
  tempoRatio: { fontSize: 22, fontWeight: '700' },
  tempoAssessment: { color: GolfColors.textSecondary, fontSize: 13 },

  phaseRow: { backgroundColor: GolfColors.surfaceLight, borderRadius: 10, padding: 12 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseName: { color: GolfColors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  phaseScore: { fontSize: 14, fontWeight: '700', width: 30, textAlign: 'right' },
  phaseBar: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  phaseBarBg: { ...StyleSheet.absoluteFillObject, backgroundColor: GolfColors.surfaceLight, borderRadius: 3 },
  phaseBarFill: { height: '100%', borderRadius: 3 },
  phaseDetails: { marginTop: 10, gap: 6 },
  angleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  angleName: { color: GolfColors.textSecondary, fontSize: 12 },
  angleValue: { color: GolfColors.text, fontSize: 12, fontWeight: '600' },
  observationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  observationText: { color: GolfColors.text, fontSize: 12, flex: 1 },

  faultCard: { backgroundColor: GolfColors.surfaceLight, borderRadius: 10, padding: 12, borderLeftWidth: 3, gap: 8 },
  faultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faultName: { color: GolfColors.text, fontSize: 14, fontWeight: '600' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  severityText: { fontSize: 11, fontWeight: '600' },
  faultDescription: { color: GolfColors.textSecondary, fontSize: 12, lineHeight: 18 },
  correctionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 8, padding: 10 },
  correctionText: { color: GolfColors.text, fontSize: 12, flex: 1, lineHeight: 18 },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthText: { color: GolfColors.text, fontSize: 14 },

  workoutCta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: GolfColors.primary,
    borderRadius: 14, padding: 16, gap: 14,
  },
  workoutCtaIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  workoutCtaTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  workoutCtaSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  aiCoachCta: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GolfColors.surface, borderRadius: 14, padding: 16, gap: 14,
    borderWidth: 2, borderColor: GolfColors.primaryLight,
  },
  aiCoachIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(74,124,89,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  aiCoachTitle: { color: GolfColors.text, fontSize: 16, fontWeight: '700' },
  aiCoachSubtitle: { color: GolfColors.textSecondary, fontSize: 12, marginTop: 2 },

  drillRecommendation: { flexDirection: 'row', alignItems: 'center', backgroundColor: GolfColors.surfaceLight, borderRadius: 10, padding: 12, gap: 12 },
  drillIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(74,124,89,0.1)', justifyContent: 'center', alignItems: 'center' },
  drillInfo: { flex: 1, gap: 2 },
  drillName: { color: GolfColors.text, fontSize: 14, fontWeight: '600' },
  drillReason: { color: GolfColors.textSecondary, fontSize: 11 },
  drillDifficulty: { fontSize: 11, fontWeight: '500' },
});
