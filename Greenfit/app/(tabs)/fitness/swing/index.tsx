import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Video, TrendingUp, Target, ChevronRight, ChevronLeft, CircleHelp } from 'lucide-react-native';
import { useSwingStore } from '@/stores/swing-store';
import { GolfColors, scoreColor } from '@/constants/golf-theme';
import type { SwingSession } from '@/types/golf';
import { CameraAngleAbbreviations } from '@/types/golf';

export default function SwingAnalysisHub() {
  const { sessions, loadSessions, deleteSession } = useSwingStore();

  useFocusEffect(useCallback(() => { loadSessions(); }, []));

  const scores = sessions
    .map((s) => s.analysis?.overallScore)
    .filter((s): s is number => s != null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;

  const handleDelete = (session: SwingSession) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this swing session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) },
    ]);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const renderSession = ({ item }: { item: SwingSession }) => {
    const score = item.analysis?.overallScore;
    const faultCount = item.analysis?.faults.length ?? 0;
    return (
      <TouchableOpacity
        style={styles.sessionRow}
        onPress={() => {
          if (item.analysis) {
            useSwingStore.getState().setCurrentAnalysis(item.analysis);
            router.push('/(tabs)/fitness/swing/results');
          }
        }}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.scoreCircle, { backgroundColor: score != null ? scoreColor(score) + '18' : GolfColors.surfaceLight }]}>
          {score != null ? (
            <Text style={[styles.scoreText, { color: scoreColor(score) }]}>{score}</Text>
          ) : (
            <CircleHelp size={18} color={GolfColors.textSecondary} />
          )}
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionTags}>
            <View style={styles.angleBadge}>
              <Text style={styles.angleBadgeText}>{CameraAngleAbbreviations[item.cameraAngle]}</Text>
            </View>
            <Text style={styles.clubText}>{item.clubType}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          {faultCount > 0 && (
            <Text style={styles.faultText}>{faultCount} fault{faultCount !== 1 ? 's' : ''} detected</Text>
          )}
        </View>
        <ChevronRight size={16} color={GolfColors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={GolfColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swing Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Record Button */}
      <TouchableOpacity style={styles.recordCard} onPress={() => router.push('/(tabs)/fitness/swing/capture')}>
        <View style={styles.recordIcon}>
          <Video size={28} color="#fff" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>Record New Swing</Text>
          <Text style={styles.recordSubtitle}>Capture and analyze your golf swing</Text>
        </View>
        <ChevronRight size={20} color={GolfColors.primary} />
      </TouchableOpacity>

      {/* Stats */}
      {sessions.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgScore ?? '--'}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestScore ?? '--'}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/fitness/swing/drills')}>
          <Target size={18} color={GolfColors.primary} />
          <Text style={styles.quickLinkText}>Drill Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/fitness/swing/progress')}>
          <TrendingUp size={18} color={GolfColors.primary} />
          <Text style={styles.quickLinkText}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Session List */}
      {sessions.length > 0 ? (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<Text style={styles.listHeader}>Recent Sessions</Text>}
        />
      ) : (
        <View style={styles.empty}>
          <Video size={48} color={GolfColors.textTertiary} />
          <Text style={styles.emptyTitle}>No Swings Recorded</Text>
          <Text style={styles.emptySubtitle}>Tap "Record New Swing" to get started with your first swing analysis.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: GolfColors.text, fontFamily: 'Inter-Bold' },

  recordCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 16, padding: 16,
    backgroundColor: GolfColors.surface, borderRadius: 16, borderWidth: 1, borderColor: GolfColors.border,
  },
  recordIcon: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: GolfColors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 16, fontWeight: '700', color: GolfColors.text, fontFamily: 'Inter-SemiBold' },
  recordSubtitle: { fontSize: 13, color: GolfColors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: GolfColors.surface, borderRadius: 12, borderWidth: 1, borderColor: GolfColors.border,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: GolfColors.text, fontFamily: 'Inter-Bold' },
  statLabel: { fontSize: 11, color: GolfColors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },

  quickLinks: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  quickLink: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, backgroundColor: GolfColors.surface, borderRadius: 12, borderWidth: 1, borderColor: GolfColors.border,
  },
  quickLinkText: { fontSize: 14, fontWeight: '600', color: GolfColors.primary, fontFamily: 'Inter-SemiBold' },

  listHeader: { fontSize: 15, fontWeight: '600', color: GolfColors.textSecondary, marginBottom: 8, fontFamily: 'Inter-SemiBold' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },

  sessionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GolfColors.border,
  },
  scoreCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter-Bold' },
  sessionInfo: { flex: 1, gap: 4 },
  sessionTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  angleBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: 'rgba(74,124,89,0.12)', borderRadius: 6 },
  angleBadgeText: { color: GolfColors.primary, fontSize: 11, fontWeight: '600' },
  clubText: { color: GolfColors.textSecondary, fontSize: 12 },
  dateText: { color: GolfColors.textSecondary, fontSize: 12 },
  faultText: { color: GolfColors.scoreFair, fontSize: 11 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: GolfColors.text, marginTop: 16, fontFamily: 'Inter-Bold' },
  emptySubtitle: { fontSize: 14, color: GolfColors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20, fontFamily: 'Inter-Regular' },
});
