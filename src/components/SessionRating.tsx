import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

const LABELS: Record<1 | 2 | 3, string> = {
  1: 'Completed',
  2: 'Strong',
  3: 'Excellent',
};

function Segment({ earned, delay, animated }: { earned: boolean; delay: number; animated: boolean }) {
  const { colors, reducedMotion } = useTheme();
  const scale = useSharedValue(animated && !reducedMotion ? 0 : 1);

  useEffect(() => {
    if (animated && !reducedMotion) {
      scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 260 }));
    }
  }, [animated, reducedMotion, delay, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        {
          width: 28,
          height: 8,
          borderRadius: 4,
          backgroundColor: earned ? colors.accent : colors.trackFaint,
          borderWidth: earned ? 1 : 0,
          borderColor: 'rgba(11,31,53,0.25)',
        },
        style,
      ]}
    />
  );
}

/** Subtle 1–3 session rating: three small segments plus a quiet label. */
export function SessionRating({ rating, animated }: { rating: 1 | 2 | 3; animated?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{ alignItems: 'center', gap: spacing.xs }}
      accessibilityLabel={`Session rating: ${LABELS[rating]} (${rating} of 3)`}
    >
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {[1, 2, 3].map((i) => (
          <Segment key={i} earned={i <= rating} delay={i * 120} animated={!!animated} />
        ))}
      </View>
      <AppText variant="caption" color={colors.textSoft}>
        {LABELS[rating]}
      </AppText>
    </View>
  );
}
