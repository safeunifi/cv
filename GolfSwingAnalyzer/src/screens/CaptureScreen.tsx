import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../utils/theme';
import {
  CameraAngle,
  CameraAngleAbbreviations,
  CameraAngleInstructions,
  ClubType,
  ALL_CLUBS,
} from '../models/types';
import AngleGuide from '../components/AngleGuide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CaptureScreen() {
  const navigation = useNavigation<any>();
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Request permissions on mount
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
      const video = await cameraRef.current.recordAsync({
        maxDuration: 15,
      });

      if (video?.uri) {
        navigation.navigate('Review', {
          videoUri: video.uri,
          cameraAngle,
          clubType,
          duration: recordingDuration,
        });
      }
    } catch (err: any) {
      Alert.alert('Recording Error', err.message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    cameraRef.current?.stopRecording();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!cameraPermission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={60} color={Colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Swing Coach needs camera access to record and analyze your golf swing.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
      >
        {/* Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => setShowAnglePicker(!showAnglePicker)}
          >
            <Ionicons name="videocam" size={16} color={Colors.white} />
            <Text style={styles.pillText}>{CameraAngleAbbreviations[cameraAngle]}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.white} />
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.pill}
            onPress={() => setShowClubPicker(!showClubPicker)}
          >
            <Ionicons name="golf" size={16} color={Colors.white} />
            <Text style={styles.pillText}>{clubType}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Angle Picker Dropdown */}
        {showAnglePicker && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={[styles.dropdownItem, cameraAngle === 'dtl' && styles.dropdownItemActive]}
              onPress={() => { setCameraAngle('dtl'); setShowAnglePicker(false); }}
            >
              <Text style={styles.dropdownText}>Down the Line (DTL)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, cameraAngle === 'faceOn' && styles.dropdownItemActive]}
              onPress={() => { setCameraAngle('faceOn'); setShowAnglePicker(false); }}
            >
              <Text style={styles.dropdownText}>Face On (FO)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Club Picker Dropdown */}
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
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => setShowGuide(!showGuide)}
          >
            <Ionicons
              name={showGuide ? 'layers' : 'layers-outline'}
              size={26}
              color={showGuide ? Colors.primary : Colors.white}
            />
            <Text style={[styles.sideButtonText, showGuide && { color: Colors.primary }]}>
              Guide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
            <View style={styles.recordOuter}>
              {isRecording ? (
                <View style={styles.recordStop} />
              ) : (
                <View style={styles.recordInner} />
              )}
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
  container: { flex: 1, backgroundColor: Colors.black },
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  permissionText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  pillText: { color: Colors.white, fontWeight: '600', fontSize: 14 },

  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.recording,
  },
  recordingTime: {
    color: Colors.white,
    fontFamily: 'Courier',
    fontWeight: '600',
    fontSize: 14,
  },

  // Dropdowns
  dropdown: {
    position: 'absolute',
    top: 105,
    left: 16,
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 12,
    padding: 4,
    zIndex: 100,
  },
  clubDropdown: {
    left: undefined,
    right: 16,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dropdownItemActive: { backgroundColor: Colors.primary },
  dropdownText: { color: Colors.white, fontSize: 14 },

  // Guide
  guideContainer: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  sideButton: { alignItems: 'center', width: 60 },
  sideButtonText: { color: Colors.white, fontSize: 11, marginTop: 4 },
  maxDurationText: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center' },

  recordButton: { alignItems: 'center', justifyContent: 'center' },
  recordOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.recording,
  },
  recordStop: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: Colors.recording,
  },
});
