import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const borderColor = error ? 'border-red-500' : 'border-sand-300 focus:border-green-500';

  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Text className="font-inter-medium text-xs uppercase tracking-wider text-sand-600 mb-1.5">
          {label}
        </Text>
      )}
      <View className={`flex-row items-center bg-sand-50 border ${borderColor} rounded-xl`}>
        {leftIcon && <View className="pl-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 py-3 px-4 font-inter text-base text-sand-900"
          placeholderTextColor="#B8B0A1"
          {...props}
        />
        {rightIcon && <View className="pr-3">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="font-inter text-xs text-red-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="font-inter text-xs text-sand-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}
