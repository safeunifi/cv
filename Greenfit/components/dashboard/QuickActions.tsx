import { View, Text, Pressable } from 'react-native';
import { UtensilsCrossed, Droplets, Dumbbell, BookOpen } from 'lucide-react-native';

interface QuickActionsProps {
  onLogFood: () => void;
  onLogWater: () => void;
  onStartWorkout: () => void;
  onViewRecipes: () => void;
}

export function QuickActions({ onLogFood, onLogWater, onStartWorkout, onViewRecipes }: QuickActionsProps) {
  const actions = [
    { label: 'Log Food', icon: UtensilsCrossed, color: '#4A7C59', bg: 'bg-green-50', onPress: onLogFood },
    { label: 'Log Water', icon: Droplets, color: '#2980B9', bg: 'bg-blue-50', onPress: onLogWater },
    { label: 'Workout', icon: Dumbbell, color: '#A68B5B', bg: 'bg-earth-50', onPress: onStartWorkout },
    { label: 'Recipes', icon: BookOpen, color: '#0D9148', bg: 'bg-fairway-50', onPress: onViewRecipes },
  ];

  return (
    <View className="flex-row gap-3">
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={action.onPress}
          className={`flex-1 ${action.bg} border border-earth-200 rounded-2xl py-4 items-center active:opacity-70`}
        >
          <action.icon size={24} color={action.color} />
          <Text className="font-inter-medium text-xs text-sand-700 mt-2">{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
