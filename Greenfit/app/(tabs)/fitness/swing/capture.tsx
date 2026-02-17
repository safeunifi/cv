import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Video, ChevronDown, Camera, Layers } from 'lucide-react-native';
import { useSwingStore } from '@/stores/swing-store';
import { GolfColors } from '@/constants/golf-theme';
import { CameraAngle, CameraAngleAbbreviations, ClubType, ALL_CLUBS } from '@/types/golf';
import AngleGuide from '@/components/golf/AngleGuide';

export default function SwingCaptureScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('dtl');
  const [clubType, setClubType] = useState<ClubType>('7 Iron');
  const [showGuide, setShowGuide] = useState(true);
  const [showAnglePicker, setShowAnglePicker] = useState(false);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
    })();
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const t = Math.floor((seconds * 10) % 10);
    return `${m}:${s.toString().padStart(2, '0')}.${t}`;
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    setRecordingDuration(0);

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 0.1);
    }, 100);

    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 15 });
      if (video?.uri) {
        useSwingStore.getState().setCurrentRecording({
          videoUri: video.uri,
          cameraAngle,
          clubType,
          duration: recordingDuration,
        });
        router.push('/(tabs)/fitness/swing/review');
      }
    } catch (err: any) {
      Alert.alert('Recording Error', err.message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    cameraRef.current?.stopRecording();
  };

  const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

  if (!cameraPermission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={60} color={GolfColors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          GreenFit needs camera access to record and analyze your golf swing.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="video">
        {/* Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.pill} onPress={() => setShowAnglePicker(!showAnglePicker)}>
            <Video size={16} color="#fff" />
            <Text style={styles.pillText}>{CameraAngleAbbreviations[cameraAngle]}</Text>
            <ChevronDown size={12} color="#fff" />
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.pill} onPress={() => setShowClubPicker(!showClubPicker)}>
            <Text style={styles.pillText}>{clubType}</Text>
            <ChevronDown size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Angle Picker */}
        {showAnglePicker && (
          <View style={styles.dropdown}>
            {(['dtl', 'faceOn'] as CameraAngle[]).map((angle) => (
              <TouchableOpacity
                key={angle}
                style={[styles.dropdownItem, cameraAngle === angle && styles.dropdownItemActive]}
                onPress={() => { setCameraAngle(angle); setShowAnglePicker(false); }}
              >
                <Text style={styles.dropdownText}>
                  {angle === 'dtl' ? 'Down the Line (DTL)' : 'Face On (FO)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Club Picker */}
        {showClubPicker && (
          <View style={[styles.dropdown, styles.clubDropdown]}>
            {ALL_CLUBS.map((club) => (
              <TouchableOpacity
                key={club}
                style={[styles.dropdownItem, clubType === club && styles.dropdownItemActive]}
                onPress={() => { setClubType(club); setShowClubPicker(false); }}
              >
                <Text style={styles.dropdownText}>{club}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Angle Guide */}
        {showGuide && !isRecording && (
          <View style={styles.guideContainer}>
            <AngleGuide cameraAngle={cameraAngle} />
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.sideButton} onPress={() => setShowGuide(!showGuide)}>
            <Layers size={26} color={showGuide ? GolfColors.primary : '#fff'} />
            <Text style={[styles.sideButtonText, showGuide && { color: GolfColors.primary }]}>Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
            <View style={styles.recordOuter}>
              {isRecording ? <View style={styles.recordStop} /> : <View style={styles.recordInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.sideButton}>
            <Text style={styles.maxDurationText}>Max 15s</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  permissionContainer: { flex: 1, backgroundColor: GolfColors.background, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionTitle: { color: GolfColors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  permissionText: { color: GolfColors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  permissionButton: { backgroundColor: GolfColors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 24 },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GolfColors.recording },
  recordingTime: { color: '#fff', fontWeight: '600', fontSize: 14 },

  dropdown: { position: 'absolute', top: 105, left: 16, backgroundColor: 'rgba(30,30,30,0.95)', borderRadius: 12, padding: 4, zIndex: 100 },
  clubDropdown: { left: undefined, right: 16, maxHeight: 300 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: GolfColors.primary },
  dropdownText: { color: '#fff', fontSize: 14 },

  guideContainer: { position: 'absolute', bottom: 140, left: 20, right: 20 },

  bottomBar: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 30 },
  sideButton: { alignItems: 'center', width: 60 },
  sideButtonText: { color: '#fff', fontSize: 11, marginTop: 4 },
  maxDurationText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' },

  recordButton: { alignItems: 'center', justifyContent: 'center' },
  recordOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  recordInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: GolfColors.recording },
  recordStop: { width: 30, height: 30, borderRadius: 6, backgroundColor: GolfColors.recording },
});
