import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { radius, shadows, spacing, tapTarget } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { tapHaptic } from '@/services/haptics/haptics';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'large' | 'medium';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  silent?: boolean;
  /** 'lime' turns a primary button into the high-emphasis performance CTA. */
  tone?: 'lime';
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  disabled,
  style,
  silent,
  tone,
}: Props) {
  const { colors, reducedMotion } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const lime = tone === 'lime' && variant === 'primary';
  const background = lime
    ? colors.accent
    : variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.card
        : variant === 'danger'
          ? colors.error
          : 'transparent';
  // Lime is fill-only: it always carries navy text for contrast.
  const textColor = lime
    ? colors.secondary
    : variant === 'ghost' || variant === 'secondary'
      ? colors.primary
      : colors.textOnDark;
  const outlined = variant === 'secondary';

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={() => {
          if (!reducedMotion) scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          if (!reducedMotion) scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        onPress={() => {
          if (!silent) {
            playSound('tap');
            tapHaptic();
          }
          onPress();
        }}
        style={{
          minHeight: size === 'large' ? tapTarget.game : tapTarget.min,
          borderRadius: radius.button,
          backgroundColor: background,
          opacity: disabled ? 0.45 : 1,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          borderWidth: outlined ? 1.5 : 0,
          borderColor: colors.primary,
          ...(variant === 'ghost' || outlined ? null : shadows.button),
        }}
      >
        {icon ? <Ionicons name={icon} size={22} color={textColor} /> : null}
        <AppText variant={size === 'large' ? 'button' : 'body'} weight="semiBold" color={textColor}>
          {title}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}
