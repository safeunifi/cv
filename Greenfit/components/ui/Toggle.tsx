import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled = false }: ToggleProps) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? '#4A7C59' : '#D5CFC3', { duration: 200 }),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 20 : 0, { duration: 200 }) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      className={disabled ? 'opacity-50' : ''}
    >
      <Animated.View
        style={trackStyle}
        className="w-12 h-7 rounded-full justify-center px-0.5"
      >
        <Animated.View
          style={thumbStyle}
          className="w-6 h-6 rounded-full bg-white shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}
