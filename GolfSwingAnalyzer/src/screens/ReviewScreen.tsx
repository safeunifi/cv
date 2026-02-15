import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { generateId as uuid } from '../utils/id';
import { Colors, scoreColor } from '../utils/theme';
import { CameraAngle, CameraAngleLabels, ClubType, SwingSession, SwingAnalysis } from '../models/types';
import { analyzeSwing, scoreGrade } from '../services/SwingAnalyzer';
import { extractPoseFrames } from '../services/PoseEstimationService';
import { StorageService } from '../services/StorageService';

export default function ReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { videoUri, cameraAngle, clubType, duration } = route.params as {
    videoUri: string;
    cameraAngle: CameraAngle;
    clubType: ClubType;
    duration: number;
  };

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.play();
  });
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);

  const rates = [0.25, 0.5, 1.0];

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    player.playbackRate = rate;
  };

  const replay = () => {
    player.replay();
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const durationMs = Math.max(duration * 1000, 3000);
      const frames = await extractPoseFrames(videoUri, durationMs, 30);
      const result = analyzeSwing(frames, cameraAngle);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
    }
    setIsAnalyzing(false);
  };

  const saveSession = async () => {
    const session: SwingSession = {
      id: uuid(),
      date: new Date().toISOString(),
      cameraAngle,
      videoUri,
      durationSeconds: duration,
      clubType,
      analysis,
      notes: '',
    };
    await StorageService.saveSession(session);
    navigation.popToTop();
  };

  const discard = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Playback Controls */}
      <View style={styles.playbackBar}>
        <View style={styles.rateButtons}>
          {rates.map((rate) => (
            <TouchableOpacity
              key={rate}
              style={[styles.rateButton, playbackRate === rate && styles.rateButtonActive]}
              onPress={() => changeRate(rate)}
            >
              <Text style={[styles.rateText, playbackRate === rate && styles.rateTextActive]}>
                {rate === 1 ? '1x' : `${rate}x`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.playControls}>
          <TouchableOpacity onPress={replay}>
            <Ionicons name="refresh" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Session Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="videocam" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{CameraAngleLabels[cameraAngle]}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="golf" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{clubType}</Text>
            </View>
          </View>
        </View>

        {/* Analysis */}
        {analysis ? (
          <TouchableOpacity
            style={styles.analysisCard}
            onPress={() => navigation.navigate('AnalysisDetail', { analysis })}
          >
            <View style={styles.analysisHeader}>
              <View>
                <Text style={styles.analysisLabel}>Swing Score</Text>
                <Text style={[styles.analysisScore, { color: scoreColor(analysis.overallScore) }]}>
                  {analysis.overallScore}
                </Text>
              </View>
              <View style={styles.analysisRight}>
                <Text style={[styles.analysisGrade, { color: scoreColor(analysis.overallScore) }]}>
                  {scoreGrade(analysis.overallScore)}
                </Text>
                <Text style={styles.analysisFaults}>
                  {analysis.faults.length} fault{analysis.faults.length !== 1 ? 's' : ''} found
                </Text>
                <Text style={styles.analysisStrengths}>
                  {analysis.strengths.length} strength{analysis.strengths.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap for full analysis</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ) : isAnalyzing ? (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.analyzingTitle}>Analyzing your swing...</Text>
            <Text style={styles.analyzingSubtitle}>Detecting body positions and calculating angles</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.analyzeButton} onPress={runAnalysis}>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
            <Text style={styles.analyzeButtonText}>Analyze Swing</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.discardButton} onPress={discard}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  video: { width: '100%', height: 280 },

  playbackBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rateButtons: { flexDirection: 'row', gap: 8 },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  rateButtonActive: { backgroundColor: Colors.primary },
  rateText: { color: Colors.text, fontSize: 13, fontFamily: 'Courier' },
  rateTextActive: { color: Colors.white, fontWeight: 'bold' },
  playControls: { flexDirection: 'row', gap: 16 },

  content: { flex: 1 },
  contentInner: { padding: 16, gap: 16 },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: Colors.textSecondary, fontSize: 13 },

  // Analysis result card
  analysisCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  analysisLabel: { color: Colors.textSecondary, fontSize: 13 },
  analysisScore: { fontSize: 48, fontWeight: 'bold' },
  analysisRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  analysisGrade: { fontSize: 18, fontWeight: 'bold' },
  analysisFaults: { color: Colors.textSecondary, fontSize: 12 },
  analysisStrengths: { color: Colors.textSecondary, fontSize: 12 },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  tapHintText: { color: Colors.textSecondary, fontSize: 12 },

  // Analyzing
  analyzingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  analyzingTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  analyzingSubtitle: { color: Colors.textSecondary, fontSize: 13 },

  // Analyze button
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
  },
  analyzeButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  // Actions
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  discardButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  discardText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
