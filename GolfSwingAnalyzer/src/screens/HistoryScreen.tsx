import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, scoreColor } from '../utils/theme';
import { SwingSession, CameraAngleAbbreviations } from '../models/types';
import { StorageService } from '../services/StorageService';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<SwingSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSessions = async () => {
    const data = await StorageService.getSessions();
    setSessions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteSession = (session: SwingSession) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this swing session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await StorageService.deleteSession(session.id);
          await loadSessions();
        },
      },
    ]);
  };

  const scores = sessions
    .map((s) => s.analysis?.overallScore)
    .filter((s): s is number => s != null);

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  const renderSession = ({ item }: { item: SwingSession }) => {
    const score = item.analysis?.overallScore;
    const faultCount = item.analysis?.faults.length ?? 0;

    return (
      <TouchableOpacity
        style={styles.sessionRow}
        onPress={() => {
          if (item.analysis) {
            navigation.navigate('AnalysisDetail', { analysis: item.analysis });
          }
        }}
        onLongPress={() => deleteSession(item)}
      >
        <View style={[styles.scoreCircle, { backgroundColor: score != null ? scoreColor(score) + '22' : Colors.surface }]}>
          {score != null ? (
            <Text style={[styles.scoreText, { color: scoreColor(score) }]}>{score}</Text>
          ) : (
            <Ionicons name="help" size={18} color={Colors.textSecondary} />
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
            <Text style={styles.faultText}>
              {faultCount} fault{faultCount !== 1 ? 's' : ''} detected
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="golf" size={60} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Swings Recorded</Text>
        <Text style={styles.emptySubtitle}>
          Start by recording your first swing in the Capture tab.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Summary */}
      {sessions.length > 1 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="videocam" size={16} color="#007AFF" />
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bar-chart" size={16} color={Colors.scoreExcellent} />
            <Text style={styles.statValue}>{avgScore ?? '--'}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={16} color={Colors.scoreGood} />
            <Text style={styles.statValue}>{bestScore ?? '--'}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>
      )}

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    gap: 4,
  },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: Colors.textSecondary, fontSize: 11 },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  sessionInfo: { flex: 1, gap: 4 },
  sessionTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  angleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(46,155,78,0.12)',
    borderRadius: 6,
  },
  angleBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  clubText: { color: Colors.textSecondary, fontSize: 12 },
  dateText: { color: Colors.textSecondary, fontSize: 12 },
  faultText: { color: Colors.scoreFair, fontSize: 11 },
});
