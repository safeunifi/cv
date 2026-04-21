import { View, Pressable } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, onPress, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const baseClasses = `bg-earth-50 border border-earth-200 rounded-2xl ${paddingClasses[padding]}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClasses} active:bg-earth-100 ${className}`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={`${baseClasses} ${className}`}>{children}</View>;
}
