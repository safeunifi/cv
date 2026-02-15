import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraAngle, CameraAngleLabels, CameraAngleInstructions } from '../models/types';
import { Colors } from '../utils/theme';

interface Props {
  cameraAngle: CameraAngle;
}

export default function AngleGuide({ cameraAngle }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setExpanded(!expanded)}
      >
        <Ionicons name="information-circle" size={16} color={Colors.white} />
        <Text style={styles.pillText}>{CameraAngleLabels[cameraAngle]}</Text>
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-up'}
          size={12}
          color={Colors.white}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedCard}>
          <Text style={styles.instructions}>
            {CameraAngleInstructions[cameraAngle]}
          </Text>

          <View style={styles.checklist}>
            <CheckItem text={`Phone at ${cameraAngle === 'dtl' ? 'hand' : 'waist'} height`} />
            <CheckItem text="~10 feet from golfer" />
            <CheckItem text="Full body visible in frame" />
            <CheckItem
              text={cameraAngle === 'dtl' ? 'Aligned with target line' : 'Perpendicular to target line'}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons name="checkmark-circle" size={14} color={Colors.scoreExcellent} />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  pillText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  expandedCard: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
  },
  instructions: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  checklist: { gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
});
