import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Droplets } from 'lucide-react-native';

interface WaterWidgetProps {
  currentMl: number;
  goalMl: number;
  onQuickAdd: (ml: number) => void;
  imperial?: boolean;
}

export function WaterWidget({ currentMl, goalMl, onQuickAdd, imperial = true }: WaterWidgetProps) {
  const progress = goalMl > 0 ? Math.min(currentMl / goalMl, 1) : 0;

  const displayCurrent = imperial ? Math.round(currentMl / 29.5735) : currentMl;
  const displayGoal = imperial ? Math.round(goalMl / 29.5735) : goalMl;
  const unit = imperial ? 'oz' : 'ml';

  // Quick add buttons in the user's preferred unit
  const quickAddOptions = imperial
    ? [
        { label: '8 oz', ml: 237 },
        { label: '12 oz', ml: 355 },
        { label: '16 oz', ml: 473 },
      ]
    : [
        { label: '250 ml', ml: 250 },
        { label: '350 ml', ml: 350 },
        { label: '500 ml', ml: 500 },
      ];

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Droplets size={20} color="#2980B9" />
          <Text className="font-inter-semibold text-base text-sand-800">Water</Text>
        </View>
        <Text className="font-inter-medium text-sm text-sand-600">
          {displayCurrent} / {displayGoal} {unit}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-3 bg-earth-200 rounded-full overflow-hidden mb-3">
        <View
          className="h-full rounded-full bg-blue-400"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      {/* Quick add buttons */}
      <View className="flex-row gap-2">
        {quickAddOptions.map((option) => (
          <Pressable
            key={option.label}
            onPress={() => onQuickAdd(option.ml)}
            className="flex-1 py-2 bg-blue-50 border border-blue-200 rounded-lg items-center active:bg-blue-100"
          >
            <Text className="font-inter-medium text-xs text-blue-600">+ {option.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
