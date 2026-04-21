import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, scoreColor } from '../utils/theme';
import { SwingSession } from '../models/types';
import { StorageService } from '../services/StorageService';

const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 160;

export default function ProgressScreen() {
  const [sessions, setSessions] = useState<SwingSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await StorageService.getSessions();
        setSessions(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      })();
    }, [])
  );

  const analyzed = sessions.filter((s) => s.analysis != null);

  if (analyzed.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trending-up" size={60} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>Track Your Progress</Text>
        <Text style={styles.emptySubtitle}>
          Record and analyze at least 2 swings to start seeing your progress over time.
        </Text>
      </View>
    );
  }

  const scores = analyzed.map((s) => s.analysis!.overallScore);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.min(...scores, 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Fault counts
  const faultMap: Record<string, number> = {};
  for (const s of analyzed) {
    for (const f of s.analysis!.faults) {
      faultMap[f.name] = (faultMap[f.name] || 0) + 1;
    }
  }
  const sortedFaults = Object.entries(faultMap).sort((a, b) => b[1] - a[1]);
  const maxFaultCount = sortedFaults.length > 0 ? sortedFaults[0][1] : 1;

  // Insights
  const insights = generateInsights(analyzed, sortedFaults);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={18} color={Colors.text} />
          <Text style={styles.cardTitle}>Score Over Time</Text>
        </View>

        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yLabel}>100</Text>
            <Text style={styles.yLabel}>50</Text>
            <Text style={styles.yLabel}>0</Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Average line */}
            <View style={[styles.avgLine, { bottom: (avgScore / 100) * CHART_HEIGHT }]}>
              <Text style={styles.avgLabel}>Avg: {avgScore}</Text>
            </View>

            {/* Data points and lines */}
            <View style={styles.chartPoints}>
              {scores.map((score, index) => {
                const x = (index / Math.max(scores.length - 1, 1)) * (CHART_WIDTH - 40);
                const y = CHART_HEIGHT - (score / 100) * CHART_HEIGHT;

                return (
                  <View
                    key={index}
                    style={[styles.dataPoint, {
                      left: x,
                      top: y - 5,
                      backgroundColor: scoreColor(score),
                    }]}
                  />
                );
              })}
            </View>

            {/* Connecting lines */}
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
                <View
                  key={`line-${index}`}
                  style={[styles.chartLine, {
                    left: x1 + 5,
                    top: y1,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                  }]}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Fault Trends */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="warning" size={18} color={Colors.scoreFair} />
          <Text style={styles.cardTitle}>Most Common Faults</Text>
        </View>

        {sortedFaults.length === 0 ? (
          <Text style={styles.noFaults}>No faults detected across your sessions.</Text>
        ) : (
          sortedFaults.slice(0, 5).map(([name, count]) => (
            <View key={name} style={styles.faultRow}>
              <Text style={styles.faultName} numberOfLines={1}>{name}</Text>
              <View style={styles.faultBarOuter}>
                <View style={[styles.faultBarInner, {
                  width: `${(count / maxFaultCount) * 100}%`,
                  backgroundColor: faultColor(name),
                }]} />
              </View>
              <Text style={styles.faultCount}>{count}</Text>
            </View>
          ))
        )}
      </View>

      {/* Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb" size={18} color={Colors.scoreGood} />
          <Text style={styles.cardTitle}>Insights</Text>
        </View>
        {insights.map((insight, i) => (
          <View key={i} style={styles.insightRow}>
            <Ionicons name="arrow-forward-circle" size={16} color={Colors.primary} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function generateInsights(
  sessions: SwingSession[],
  faults: [string, number][],
): string[] {
  const insights: string[] = [];
  const scores = sessions.map((s) => s.analysis!.overallScore);

  if (scores.length >= 3) {
    const recent = scores.slice(-3);
    const older = scores.slice(0, Math.max(1, scores.length - 3));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg + 5) {
      insights.push('Your scores are trending upward. Keep up the good work!');
    } else if (recentAvg < olderAvg - 5) {
      insights.push('Your recent scores have dipped. Focus on the fundamentals in your next session.');
    } else {
      insights.push('Your scores have been consistent. Time to target specific improvements.');
    }
  }

  if (faults.length > 0) {
    insights.push(
      `Your most recurring fault is "${faults[0][0]}" (${faults[0][1]} occurrences). Focus your practice drills on this area.`
    );
  }

  if (sessions.length >= 2) {
    const firstDate = new Date(sessions[0].date);
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const daysBetween = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysBetween > 0) {
      const perWeek = (sessions.length / daysBetween) * 7;
      if (perWeek >= 3) {
        insights.push(`You're practicing frequently (~${Math.round(perWeek)}x per week). Consistency leads to improvement.`);
      } else if (perWeek >= 1) {
        insights.push(`You're averaging about ${Math.round(perWeek)} session(s) per week. Try to increase to 2-3 for faster improvement.`);
      }
    }
  }

  if (insights.length === 0) {
    insights.push('Keep recording swings to unlock personalized insights.');
  }

  return insights;
}

function faultColor(name: string): string {
  const map: Record<string, string> = {
    'Early Extension': '#FF453A',
    'Hip Sway': '#FF9F0A',
    'Casting / Early Release': '#BF5AF2',
    'Restricted Turn': '#007AFF',
    'Chicken Wing': '#FF375F',
    'Head Movement': '#FFD60A',
  };
  return map[name] ?? '#8E8E93';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16 },

  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },

  // Chart
  chart: { flexDirection: 'row', height: CHART_HEIGHT + 20 },
  yAxis: { width: 30, justifyContent: 'space-between', paddingVertical: 5 },
  yLabel: { color: Colors.textTertiary, fontSize: 10, textAlign: 'right' },
  chartArea: { flex: 1, height: CHART_HEIGHT, position: 'relative' },
  chartPoints: { position: 'absolute', width: '100%', height: '100%' },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    transformOrigin: 'left center',
  },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: Colors.textTertiary,
    borderStyle: 'dashed',
  },
  avgLabel: { color: Colors.textTertiary, fontSize: 9, position: 'absolute', right: 0, top: -12 },

  // Faults
  noFaults: { color: Colors.textSecondary, fontSize: 14 },
  faultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faultName: { color: Colors.text, fontSize: 13, width: 110 },
  faultBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  faultBarInner: { height: '100%', borderRadius: 4 },
  faultCount: { color: Colors.textSecondary, fontSize: 12, width: 20, textAlign: 'right' },

  // Insights
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  insightText: { color: Colors.text, fontSize: 14, flex: 1, lineHeight: 20 },
});
