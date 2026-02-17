import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
  unit?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#4A7C59',
  backgroundColor = '#E5DDD1',
  label,
  value,
  unit,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {value && (
          <View className="absolute inset-0 items-center justify-center">
            <Text className="font-inter-bold text-sm text-sand-900">{value}</Text>
            {unit && (
              <Text className="font-inter text-xs text-sand-500">{unit}</Text>
            )}
          </View>
        )}
      </View>
      {label && (
        <Text className="font-inter-medium text-xs text-sand-600 mt-1">{label}</Text>
      )}
    </View>
  );
}
