import { View, Text, Pressable } from 'react-native';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
}

export function Stepper({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  formatValue,
}: StepperProps) {
  const decrement = () => {
    if (value - step >= min) onChange(value - step);
  };

  const increment = () => {
    if (value + step <= max) onChange(value + step);
  };

  const displayValue = formatValue ? formatValue(value) : String(value);
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  return (
    <View className="items-center">
      {label && (
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={decrement}
          disabled={!canDecrement}
          className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
            canDecrement ? 'border-green-500 active:bg-green-50' : 'border-sand-300 opacity-40'
          }`}
        >
          <Text className={`text-xl font-inter-bold ${canDecrement ? 'text-green-600' : 'text-sand-400'}`}>
            -
          </Text>
        </Pressable>

        <Text className="font-inter-bold text-3xl text-sand-900 min-w-[60px] text-center">
          {displayValue}
        </Text>

        <Pressable
          onPress={increment}
          disabled={!canIncrement}
          className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
            canIncrement ? 'border-green-500 active:bg-green-50' : 'border-sand-300 opacity-40'
          }`}
        >
          <Text className={`text-xl font-inter-bold ${canIncrement ? 'text-green-600' : 'text-sand-400'}`}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
