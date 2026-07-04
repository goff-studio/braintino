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
}: Props) {
  const { colors, reducedMotion } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.secondary
        : variant === 'danger'
          ? colors.error
          : 'transparent';
  const textColor = variant === 'ghost' ? colors.primary : colors.textOnDark;

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
          borderWidth: variant === 'ghost' ? 2 : 0,
          borderColor: colors.primary,
          ...(variant !== 'ghost' ? shadows.button : null),
        }}
      >
        {icon ? <Ionicons name={icon} size={22} color={textColor} /> : null}
        <AppText variant={size === 'large' ? 'button' : 'body'} weight="bold" color={textColor}>
          {title}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}
