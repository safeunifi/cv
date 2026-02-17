import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Info, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react-native';
import type { CameraAngle } from '@/types/golf';
import { CameraAngleLabels, CameraAngleInstructions } from '@/types/golf';

interface Props {
  cameraAngle: CameraAngle;
}

export default function AngleGuide({ cameraAngle }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.pill} onPress={() => setExpanded(!expanded)}>
        <Info size={16} color="#fff" />
        <Text style={styles.pillText}>{CameraAngleLabels[cameraAngle]}</Text>
        {expanded ? <ChevronDown size={12} color="#fff" /> : <ChevronUp size={12} color="#fff" />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedCard}>
          <Text style={styles.instructions}>{CameraAngleInstructions[cameraAngle]}</Text>
          <View style={styles.checklist}>
            <CheckItem text={`Phone at ${cameraAngle === 'dtl' ? 'hand' : 'waist'} height`} />
            <CheckItem text="~10 feet from golfer" />
            <CheckItem text="Full body visible in frame" />
            <CheckItem text={cameraAngle === 'dtl' ? 'Aligned with target line' : 'Perpendicular to target line'} />
          </View>
        </View>
      )}
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <CheckCircle2 size={14} color="#17B85E" />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    gap: 6, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
  },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  expandedCard: {
    marginTop: 8, padding: 16, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16,
  },
  instructions: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  checklist: { gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
});
