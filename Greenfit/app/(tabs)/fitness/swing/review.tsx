import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { RefreshCw, Sparkles, Video } from 'lucide-react-native';
import { generateId as uuid } from '@/lib/golf/id';
import { GolfColors, scoreColor } from '@/constants/golf-theme';
import { CameraAngleLabels } from '@/types/golf';
import type { SwingSession, SwingAnalysis } from '@/types/golf';
import { analyzeSwing, scoreGrade } from '@/lib/golf/swing-analyzer';
import { extractPoseFrames } from '@/lib/golf/pose-estimation';
import { useSwingStore } from '@/stores/swing-store';

export default function SwingReviewScreen() {
  const {
    currentVideoUri, currentCameraAngle, currentClubType, currentDuration,
    currentAnalysis, setCurrentAnalysis, saveSession, clearCurrentRecording,
  } = useSwingStore();

  const videoUri = currentVideoUri ?? '';
  const player = useVideoPlayer(videoUri, (p) => { p.loop = true; p.play(); });
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const rates = [0.25, 0.5, 1.0];

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    player.playbackRate = rate;
  };

  const runAnalysis = async () => {
    if (typeof globalThis.crypto === 'undefined') (globalThis as any).crypto = {};
    if (!(globalThis.crypto as any).getRandomValues) {
      (globalThis.crypto as any).getRandomValues = function (arr: any) {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
        return arr;
      };
    }

    setIsAnalyzing(true);
    try {
      const durationMs = Math.max(currentDuration * 1000, 3000);
      const frames = await extractPoseFrames(videoUri, durationMs, 30);
      const result = analyzeSwing(frames, currentCameraAngle);
      setCurrentAnalysis(result);
    } catch (err: any) {
      console.error('Analysis failed:', err?.message ?? err);
    }
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    const session: SwingSession = {
      id: uuid(),
      date: new Date().toISOString(),
      cameraAngle: currentCameraAngle,
      videoUri,
      durationSeconds: currentDuration,
      clubType: currentClubType,
      analysis: currentAnalysis,
      notes: '',
    };
    await saveSession(session);
    clearCurrentRecording();
    router.dismissTo('/(tabs)/fitness/swing');
  };

  const handleDiscard = () => {
    clearCurrentRecording();
    router.back();
  };

  return (
    <View style={styles.container}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />

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
        <TouchableOpacity onPress={() => player.replay()}>
          <RefreshCw size={22} color={GolfColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Session Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Video size={14} color={GolfColors.textSecondary} />
              <Text style={styles.infoText}>{CameraAngleLabels[currentCameraAngle]}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{currentClubType}</Text>
            </View>
          </View>
        </View>

        {/* Analysis */}
        {currentAnalysis ? (
          <TouchableOpacity
            style={styles.analysisCard}
            onPress={() => router.push('/(tabs)/fitness/swing/results')}
          >
            <View style={styles.analysisHeader}>
              <View>
                <Text style={styles.analysisLabel}>Swing Score</Text>
                <Text style={[styles.analysisScore, { color: scoreColor(currentAnalysis.overallScore) }]}>
                  {currentAnalysis.overallScore}
                </Text>
              </View>
              <View style={styles.analysisRight}>
                <Text style={[styles.analysisGrade, { color: scoreColor(currentAnalysis.overallScore) }]}>
                  {scoreGrade(currentAnalysis.overallScore)}
                </Text>
                <Text style={styles.analysisFaults}>
                  {currentAnalysis.faults.length} fault{currentAnalysis.faults.length !== 1 ? 's' : ''} found
                </Text>
                <Text style={styles.analysisStrengths}>
                  {currentAnalysis.strengths.length} strength{currentAnalysis.strengths.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap for full analysis</Text>
            </View>
          </TouchableOpacity>
        ) : isAnalyzing ? (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={GolfColors.primary} />
            <Text style={styles.analyzingTitle}>Analyzing your swing...</Text>
            <Text style={styles.analyzingSubtitle}>Detecting body positions and calculating angles</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.analyzeButton} onPress={runAnalysis}>
            <Sparkles size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Analyze Swing</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },
  video: { width: '100%', height: 280 },

  playbackBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GolfColors.border,
  },
  rateButtons: { flexDirection: 'row', gap: 8 },
  rateButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: GolfColors.surfaceLight },
  rateButtonActive: { backgroundColor: GolfColors.primary },
  rateText: { color: GolfColors.text, fontSize: 13 },
  rateTextActive: { color: '#fff', fontWeight: '700' },

  content: { flex: 1 },
  contentInner: { padding: 16, gap: 16 },

  infoCard: { backgroundColor: GolfColors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: GolfColors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: GolfColors.textSecondary, fontSize: 13 },

  analysisCard: { backgroundColor: GolfColors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: GolfColors.border },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  analysisLabel: { color: GolfColors.textSecondary, fontSize: 13 },
  analysisScore: { fontSize: 48, fontWeight: '700' },
  analysisRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  analysisGrade: { fontSize: 18, fontWeight: '700' },
  analysisFaults: { color: GolfColors.textSecondary, fontSize: 12 },
  analysisStrengths: { color: GolfColors.textSecondary, fontSize: 12 },
  tapHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 4 },
  tapHintText: { color: GolfColors.textSecondary, fontSize: 12 },

  analyzingCard: { backgroundColor: GolfColors.surface, borderRadius: 12, padding: 30, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: GolfColors.border },
  analyzingTitle: { color: GolfColors.text, fontSize: 16, fontWeight: '600' },
  analyzingSubtitle: { color: GolfColors.textSecondary, fontSize: 13 },

  analyzeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GolfColors.primary, borderRadius: 12, padding: 16,
  },
  analyzeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  actionBar: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: GolfColors.border },
  discardButton: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: GolfColors.border, alignItems: 'center' },
  discardText: { color: GolfColors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: GolfColors.primary, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
