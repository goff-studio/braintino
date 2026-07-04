import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  stars: number;
  max?: number;
  size?: number;
  /** Pop the stars in one-by-one (results screen). */
  animated?: boolean;
};

function Star({ earned, size, delay, animated }: { earned: boolean; size: number; delay: number; animated: boolean }) {
  const { reducedMotion } = useTheme();
  const scale = useSharedValue(animated && !reducedMotion ? 0 : 1);

  useEffect(() => {
    if (animated && !reducedMotion) {
      scale.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 200 }));
    }
  }, [animated, reducedMotion, delay, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Ionicons
        name={earned ? 'star' : 'star-outline'}
        size={size}
        color={earned ? palette.warmYellow : 'rgba(16,42,67,0.25)'}
      />
    </Animated.View>
  );
}

export function StarRating({ stars, max = 3, size = 28, animated = false }: Props) {
  return (
    <View
      style={{ flexDirection: 'row', gap: size * 0.2 }}
      accessibilityLabel={`${stars} of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} earned={i < stars} size={size} delay={300 + i * 260} animated={animated} />
      ))}
    </View>
  );
}
