import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { TrendingUp, AlertTriangle, Lightbulb, ArrowRightCircle, ChevronLeft } from 'lucide-react-native';
import { GolfColors, scoreColor } from '@/constants/golf-theme';
import { useSwingStore } from '@/stores/swing-store';
import type { SwingSession } from '@/types/golf';

const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 160;

export default function SwingProgressScreen() {
  const { sessions, loadSessions } = useSwingStore();

  useFocusEffect(useCallback(() => { loadSessions(); }, []));

  const chronological = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const analyzed = chronological.filter((s) => s.analysis != null);

  if (analyzed.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={GolfColors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.emptyContent}>
          <TrendingUp size={60} color={GolfColors.textSecondary} />
          <Text style={styles.emptyTitle}>Track Your Progress</Text>
          <Text style={styles.emptySubtitle}>Record and analyze at least 2 swings to start seeing your progress over time.</Text>
        </View>
      </View>
    );
  }

  const scores = analyzed.map((s) => s.analysis!.overallScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const faultMap: Record<string, number> = {};
  for (const s of analyzed) {
    for (const f of s.analysis!.faults) {
      faultMap[f.name] = (faultMap[f.name] || 0) + 1;
    }
  }
  const sortedFaults = Object.entries(faultMap).sort((a, b) => b[1] - a[1]);
  const maxFaultCount = sortedFaults.length > 0 ? sortedFaults[0][1] : 1;

  const insights = generateInsights(analyzed, sortedFaults);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={GolfColors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Swing Progress</Text>

      {/* Score Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp size={18} color={GolfColors.text} />
          <Text style={styles.cardTitle}>Score Over Time</Text>
        </View>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            <Text style={styles.yLabel}>100</Text>
            <Text style={styles.yLabel}>50</Text>
            <Text style={styles.yLabel}>0</Text>
          </View>
          <View style={styles.chartArea}>
            <View style={[styles.avgLine, { bottom: (avgScore / 100) * CHART_HEIGHT }]}>
              <Text style={styles.avgLabel}>Avg: {avgScore}</Text>
            </View>
            <View style={styles.chartPoints}>
              {scores.map((score, index) => {
                const x = (index / Math.max(scores.length - 1, 1)) * (CHART_WIDTH - 40);
                const y = CHART_HEIGHT - (score / 100) * CHART_HEIGHT;
                return (
                  <View key={index} style={[styles.dataPoint, { left: x, top: y - 5, backgroundColor: scoreColor(score) }]} />
                );
              })}
            </View>
            {scores.length > 1 && scores.map((score, index) => {
              if (index === 0) return null;
              const prevScore = scores[index - 1];
              const x1 = ((index - 1) / Math.max(scores.length - 1, 1)) * (CHART_WIDTH - 40);
              const y1 = CHART_HEIGHT - (prevScore / 100) * CHART_HEIGHT;
              const x2 = (index / Math.max(scores.length - 1, 1)) * (CHART_WIDTH - 40);
              const y2 = CHART_HEIGHT - (score / 100) * CHART_HEIGHT;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <View key={`line-${index}`} style={[styles.chartLine, { left: x1 + 5, top: y1, width: length, transform: [{ rotate: `${angle}deg` }] }]} />
              );
            })}
          </View>
        </View>
      </View>

      {/* Fault Trends */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AlertTriangle size={18} color={GolfColors.scoreFair} />
          <Text style={styles.cardTitle}>Most Common Faults</Text>
        </View>
        {sortedFaults.length === 0 ? (
          <Text style={styles.noFaults}>No faults detected across your sessions.</Text>
        ) : (
          sortedFaults.slice(0, 5).map(([name, count]) => (
            <View key={name} style={styles.faultRow}>
              <Text style={styles.faultName} numberOfLines={1}>{name}</Text>
              <View style={styles.faultBarOuter}>
                <View style={[styles.faultBarInner, { width: `${(count / maxFaultCount) * 100}%`, backgroundColor: faultColor(name) }]} />
              </View>
              <Text style={styles.faultCount}>{count}</Text>
            </View>
          ))
        )}
      </View>

      {/* Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Lightbulb size={18} color={GolfColors.scoreGood} />
          <Text style={styles.cardTitle}>Insights</Text>
        </View>
        {insights.map((insight, i) => (
          <View key={i} style={styles.insightRow}>
            <ArrowRightCircle size={16} color={GolfColors.primary} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function generateInsights(sessions: SwingSession[], faults: [string, number][]): string[] {
  const insights: string[] = [];
  const scores = sessions.map((s) => s.analysis!.overallScore);

  if (scores.length >= 3) {
    const recent = scores.slice(-3);
    const older = scores.slice(0, Math.max(1, scores.length - 3));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    if (recentAvg > olderAvg + 5) insights.push('Your scores are trending upward. Keep up the good work!');
    else if (recentAvg < olderAvg - 5) insights.push('Your recent scores have dipped. Focus on the fundamentals in your next session.');
    else insights.push('Your scores have been consistent. Time to target specific improvements.');
  }

  if (faults.length > 0) {
    insights.push(`Your most recurring fault is "${faults[0][0]}" (${faults[0][1]} occurrences). Focus your practice drills on this area.`);
  }

  if (sessions.length >= 2) {
    const firstDate = new Date(sessions[0].date);
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const daysBetween = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysBetween > 0) {
      const perWeek = (sessions.length / daysBetween) * 7;
      if (perWeek >= 3) insights.push(`You're practicing frequently (~${Math.round(perWeek)}x per week). Consistency leads to improvement.`);
      else if (perWeek >= 1) insights.push(`You're averaging about ${Math.round(perWeek)} session(s) per week. Try to increase to 2-3 for faster improvement.`);
    }
  }

  if (insights.length === 0) insights.push('Keep recording swings to unlock personalized insights.');
  return insights;
}

function faultColor(name: string): string {
  const map: Record<string, string> = {
    'Early Extension': '#C0392B', 'Hip Sway': '#FF9F0A', 'Casting / Early Release': '#8E44AD',
    'Restricted Turn': '#2980B9', 'Chicken Wing': '#E74C3C', 'Head Movement': '#D4A017',
  };
  return map[name] ?? '#9B917F';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  content: { padding: 16, gap: 16 },

  emptyContainer: { flex: 1, backgroundColor: GolfColors.background, padding: 16 },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: GolfColors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptySubtitle: { color: GolfColors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 16, color: GolfColors.text, fontWeight: '500' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: GolfColors.text },

  card: { backgroundColor: GolfColors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: GolfColors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: GolfColors.text, fontSize: 16, fontWeight: '700' },

  chart: { flexDirection: 'row', height: CHART_HEIGHT + 20 },
  yAxis: { width: 30, justifyContent: 'space-between', paddingVertical: 5 },
  yLabel: { color: GolfColors.textTertiary, fontSize: 10, textAlign: 'right' },
  chartArea: { flex: 1, height: CHART_HEIGHT, position: 'relative' },
  chartPoints: { position: 'absolute', width: '100%', height: '100%' },
  dataPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: GolfColors.surface },
  chartLine: { position: 'absolute', height: 2, backgroundColor: GolfColors.primary, transformOrigin: 'left center' },
  avgLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderTopColor: GolfColors.textTertiary, borderStyle: 'dashed' },
  avgLabel: { color: GolfColors.textTertiary, fontSize: 9, position: 'absolute', right: 0, top: -12 },

  noFaults: { color: GolfColors.textSecondary, fontSize: 14 },
  faultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faultName: { color: GolfColors.text, fontSize: 13, width: 110 },
  faultBarOuter: { flex: 1, height: 8, backgroundColor: GolfColors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  faultBarInner: { height: '100%', borderRadius: 4 },
  faultCount: { color: GolfColors.textSecondary, fontSize: 12, width: 20, textAlign: 'right' },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  insightText: { color: GolfColors.text, fontSize: 14, flex: 1, lineHeight: 20 },
});
