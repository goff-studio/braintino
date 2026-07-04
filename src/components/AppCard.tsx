import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadows, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { tapHaptic } from '@/services/haptics/haptics';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
  accessibilityLabel?: string;
};

export function AppCard({ children, onPress, style, color, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const baseStyle: ViewStyle = {
    backgroundColor: color ?? colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  };

  if (!onPress) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        playSound('tap');
        tapHaptic();
        onPress();
      }}
      style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.9 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
