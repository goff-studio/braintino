import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/AppText';

type Props = {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Bump to replay the "rule changed" attention animation. */
  changeToken?: number;
};

/** Clear, neutral rule banner used by rule-switching games. */
export function RuleBanner({ text, icon = 'information-circle-outline', changeToken = 0 }: Props) {
  const { colors, reducedMotion } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (changeToken > 0 && !reducedMotion) {
      scale.value = withSequence(
        withTiming(1.12, { duration: 160 }),
        withSpring(1, { damping: 10, stiffness: 220 })
      );
    }
  }, [changeToken, reducedMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        {
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.secondary,
          borderRadius: radius.button,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          minHeight: 52,
        },
        style,
      ]}
      accessibilityLabel={`Current rule: ${text}`}
    >
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      <AppText variant="gameLabel" weight="bold" color="#FFFFFF">
        {text}
      </AppText>
    </Animated.View>
  );
}
