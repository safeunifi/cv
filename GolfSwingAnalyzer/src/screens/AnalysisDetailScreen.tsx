import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, scoreColor, severityColor, difficultyColor } from '../utils/theme';
import {
  SwingAnalysis,
  SWING_PHASES,
  SwingPhaseLabels,
  PhaseAnalysis,
  SwingFault,
} from '../models/types';
import { scoreGrade, tempoAssessment } from '../services/SwingAnalyzer';
import { getDrillById } from '../data/drills';

export default function AnalysisDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { analysis } = route.params as { analysis: SwingAnalysis };
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score Circle */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor(analysis.overallScore) }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor(analysis.overallScore) }]}>
            {analysis.overallScore}
          </Text>
          <Text style={styles.scoreLabel}>{scoreGrade(analysis.overallScore)}</Text>
        </View>
      </View>

      {/* Tempo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="speedometer" size={18} color={Colors.text} />
          <Text style={styles.cardTitle}>Swing Tempo</Text>
        </View>
        <View style={styles.tempoRow}>
          <View style={styles.tempoItem}>
            <Text style={styles.tempoValue}>{analysis.tempo.backswingDuration.toFixed(1)}s</Text>
            <Text style={styles.tempoLabel}>Backswing</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
          <View style={styles.tempoItem}>
            <Text style={styles.tempoValue}>{analysis.tempo.downswingDuration.toFixed(1)}s</Text>
            <Text style={styles.tempoLabel}>Downswing</Text>
          </View>
          <View style={styles.tempoItem}>
            <Text style={[styles.tempoRatio, {
              color: analysis.tempo.ratio >= 2.5 && analysis.tempo.ratio <= 3.5
                ? Colors.scoreExcellent : Colors.scoreFair
            }]}>
              {analysis.tempo.ratio.toFixed(1)}:1
            </Text>
            <Text style={styles.tempoLabel}>Ratio</Text>
          </View>
        </View>
        <Text style={styles.tempoAssessment}>{tempoAssessment(analysis.tempo.ratio)}</Text>
      </View>

      {/* Phase Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart" size={18} color={Colors.text} />
          <Text style={styles.cardTitle}>Phase Breakdown</Text>
        </View>
        {SWING_PHASES.map((phase) => {
          const data = analysis.phases[phase];
          if (!data) return null;
          return (
            <PhaseRow
              key={phase}
              phase={phase}
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
            <Ionicons name="warning" size={18} color={Colors.scoreFair} />
            <Text style={styles.cardTitle}>Swing Faults</Text>
          </View>
          {analysis.faults.map((fault) => (
            <FaultCard key={fault.id} fault={fault} />
          ))}
        </View>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <View style={[styles.card, { backgroundColor: 'rgba(52,199,89,0.08)' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="star" size={18} color={Colors.scoreExcellent} />
            <Text style={styles.cardTitle}>Strengths</Text>
          </View>
          {analysis.strengths.map((s, i) => (
            <View key={i} style={styles.strengthRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.scoreExcellent} />
              <Text style={styles.strengthText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Drills */}
      {analysis.recommendations.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="golf" size={18} color={Colors.text} />
            <Text style={styles.cardTitle}>Recommended Drills</Text>
          </View>
          {analysis.recommendations.map((rec) => {
            const drill = getDrillById(rec.drillId);
            if (!drill) return null;
            return (
              <TouchableOpacity
                key={rec.id}
                style={styles.drillRecommendation}
                onPress={() => navigation.navigate('DrillDetail', { drill })}
              >
                <View style={styles.drillIcon}>
                  <Ionicons name="fitness" size={22} color={Colors.primary} />
                </View>
                <View style={styles.drillInfo}>
                  <Text style={styles.drillName}>{drill.name}</Text>
                  <Text style={styles.drillReason}>{rec.reason}</Text>
                  <Text style={[styles.drillDifficulty, { color: difficultyColor(drill.difficulty) }]}>
                    {drill.difficulty}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Phase Row Component ─────────────────────────────────

function PhaseRow({
  phase,
  label,
  data,
  isExpanded,
  onPress,
}: {
  phase: string;
  label: string;
  data: PhaseAnalysis;
  isExpanded: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.phaseRow} onPress={onPress}>
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseName}>{label}</Text>
        <Text style={[styles.phaseScore, { color: scoreColor(data.score) }]}>{data.score}</Text>
        <View style={styles.phaseBar}>
          <View style={styles.phaseBarBg} />
          <View
            style={[styles.phaseBarFill, {
              width: `${data.score}%`,
              backgroundColor: scoreColor(data.score),
            }]}
          />
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={Colors.textSecondary}
        />
      </View>

      {isExpanded && (
        <View style={styles.phaseDetails}>
          {Object.entries(data.keyAngles).sort().map(([name, value]) => (
            <View key={name} style={styles.angleRow}>
              <Text style={styles.angleName}>{name}</Text>
              <Text style={styles.angleValue}>{Math.round(value)}°</Text>
            </View>
          ))}
          {data.observations.map((obs, i) => (
            <View key={i} style={styles.observationRow}>
              <Ionicons name="arrow-forward-circle" size={12} color={Colors.primary} />
              <Text style={styles.observationText}>{obs}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Fault Card Component ────────────────────────────────

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
        <Ionicons name="bulb" size={14} color={Colors.scoreGood} />
        <Text style={styles.correctionText}>{fault.correction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16 },

  // Score
  scoreSection: { alignItems: 'center', paddingVertical: 8 },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { fontSize: 44, fontWeight: 'bold' },
  scoreLabel: { color: Colors.textSecondary, fontSize: 13 },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },

  // Tempo
  tempoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tempoItem: { alignItems: 'center' },
  tempoValue: { color: Colors.text, fontSize: 18, fontWeight: 'bold', fontFamily: 'Courier' },
  tempoLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  tempoRatio: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Courier' },
  tempoAssessment: { color: Colors.textSecondary, fontSize: 13 },

  // Phase rows
  phaseRow: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
  },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseName: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  phaseScore: { fontSize: 14, fontWeight: 'bold', width: 30, textAlign: 'right' },
  phaseBar: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  phaseBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
  },
  phaseBarFill: { height: '100%', borderRadius: 3 },
  phaseDetails: { marginTop: 10, gap: 6 },
  angleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  angleName: { color: Colors.textSecondary, fontSize: 12 },
  angleValue: { color: Colors.text, fontSize: 12, fontWeight: '600', fontFamily: 'Courier' },
  observationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  observationText: { color: Colors.text, fontSize: 12, flex: 1 },

  // Faults
  faultCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    gap: 8,
  },
  faultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faultName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  severityText: { fontSize: 11, fontWeight: '600' },
  faultDescription: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  correctionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,214,10,0.08)',
    borderRadius: 8,
    padding: 10,
  },
  correctionText: { color: Colors.text, fontSize: 12, flex: 1, lineHeight: 18 },

  // Strengths
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthText: { color: Colors.text, fontSize: 14 },

  // Drill recommendations
  drillRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  drillIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(46,155,78,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillInfo: { flex: 1, gap: 2 },
  drillName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  drillReason: { color: Colors.textSecondary, fontSize: 11 },
  drillDifficulty: { fontSize: 11, fontWeight: '500' },
});
