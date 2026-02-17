import { Pressable, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl';
  const widthClass = fullWidth ? 'w-full' : '';

  const sizeClasses = {
    sm: 'py-2 px-4',
    md: 'py-3.5 px-6',
    lg: 'py-4 px-8',
  };

  const variantClasses = {
    primary: 'bg-green-500 active:bg-green-600',
    secondary: 'bg-earth-100 border border-earth-300 active:bg-earth-200',
    outline: 'border-2 border-green-500 active:bg-green-50',
    ghost: 'active:bg-sand-100',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-green-700',
    outline: 'text-green-600',
    ghost: 'text-green-600',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClass = disabled || loading ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : '#4A7C59'}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={`font-inter-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]}`}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
