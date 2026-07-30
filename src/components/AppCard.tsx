import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/colors';
import { radius, shadows, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { tapHaptic } from '@/services/haptics/haptics';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
  /** Premium hero card: 135° blue→navy gradient, larger radius, no border. */
  hero?: boolean;
  accessibilityLabel?: string;
};

export function AppCard({ children, onPress, style, color, hero, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const baseStyle: ViewStyle = hero
    ? {
        borderRadius: radius.cardLarge,
        padding: spacing.xl,
        overflow: 'hidden',
        ...shadows.card,
      }
    : {
        backgroundColor: color ?? colors.card,
        borderRadius: radius.card,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
      };

  const content = hero ? (
    <>
      <LinearGradient
        colors={[...gradients.hero] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {children}
    </>
  ) : (
    children
  );

  if (!onPress) {
    return <View style={[baseStyle, style]}>{content}</View>;
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
      {content}
    </Pressable>
  );
}
