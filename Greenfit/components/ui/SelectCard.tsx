import { Pressable, View, Text } from 'react-native';

interface SelectCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export function SelectCard({
  title,
  description,
  selected,
  onPress,
  icon,
}: SelectCardProps) {
  const borderClass = selected
    ? 'border-2 border-green-500 bg-green-50'
    : 'border border-earth-200 bg-earth-50';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl p-4 ${borderClass} active:opacity-80`}
    >
      <View className="flex-row items-center gap-3">
        {icon && (
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              selected ? 'bg-green-100' : 'bg-earth-100'
            }`}
          >
            {icon}
          </View>
        )}
        <View className="flex-1">
          <Text
            className={`font-inter-semibold text-base ${
              selected ? 'text-green-700' : 'text-sand-800'
            }`}
          >
            {title}
          </Text>
          {description && (
            <Text className="font-inter text-sm text-sand-500 mt-0.5">
              {description}
            </Text>
          )}
        </View>
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            selected ? 'border-green-500 bg-green-500' : 'border-sand-400'
          }`}
        >
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </View>
      </View>
    </Pressable>
  );
}
