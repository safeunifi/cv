import { Pressable, Text } from 'react-native';

interface PillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export function Pill({ label, selected, onPress, size = 'md' }: PillProps) {
  const sizeClasses = {
    sm: 'px-3 py-1',
    md: 'px-4 py-2',
  };

  const bgClass = selected ? 'bg-green-500' : 'bg-earth-100 border border-earth-300';
  const textClass = selected ? 'text-white' : 'text-sand-700';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full ${sizeClasses[size]} ${bgClass}`}
    >
      <Text className={`font-inter-medium text-sm ${textClass}`}>{label}</Text>
    </Pressable>
  );
}
