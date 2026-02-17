import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface TodayMacroCardProps {
  calories: number;
  targetCalories: number;
  proteinG: number;
  targetProteinG: number;
  carbsG: number;
  targetCarbsG: number;
  fatG: number;
  targetFatG: number;
}

export function TodayMacroCard({
  calories,
  targetCalories,
  proteinG,
  targetProteinG,
  carbsG,
  targetCarbsG,
  fatG,
  targetFatG,
}: TodayMacroCardProps) {
  const remaining = Math.max(targetCalories - calories, 0);

  return (
    <Card>
      <Text className="font-inter-semibold text-lg text-sand-800 mb-4">Today's Nutrition</Text>

      <View className="flex-row items-center">
        {/* Main calorie ring */}
        <View className="mr-6">
          <ProgressRing
            progress={targetCalories > 0 ? calories / targetCalories : 0}
            size={100}
            strokeWidth={10}
            color="#4A7C59"
            value={String(remaining)}
            unit="remaining"
          />
        </View>

        {/* Macro breakdown */}
        <View className="flex-1 gap-3">
          <MacroRow
            label="Protein"
            current={proteinG}
            target={targetProteinG}
            color="#4A7C59"
          />
          <MacroRow
            label="Carbs"
            current={carbsG}
            target={targetCarbsG}
            color="#34D67A"
          />
          <MacroRow
            label="Fat"
            current={fatG}
            target={targetFatG}
            color="#A68B5B"
          />
        </View>
      </View>
    </Card>
  );
}

function MacroRow({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text className="font-inter text-xs text-sand-600">{label}</Text>
        <Text className="font-inter-medium text-xs text-sand-800">
          {Math.round(current)}/{target}g
        </Text>
      </View>
      <View className="h-2 bg-earth-200 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${progress * 100}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
