import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: React.ReactNode;
  gradient: readonly [string, string, ...string[]] | readonly string[];
  /** Draw soft floating puzzle shapes behind content. */
  decorative?: boolean;
};

function FloatingShape({
  x,
  y,
  size,
  color,
  delay,
  square,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  square?: boolean;
}) {
  const { reducedMotion } = useTheme();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    drift.value = withTiming(0, { duration: 0 });
    drift.value = withRepeat(
      withTiming(1, { duration: 5200 + delay, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [reducedMotion, drift, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * 14 }, { rotate: `${drift.value * 8}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: square ? size * 0.3 : size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function ScreenBackground({ children, gradient, decorative = true }: Props) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[...gradient] as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />
      {decorative && (
        <>
          <FloatingShape x={width * 0.08} y={height * 0.1} size={54} color="rgba(255,255,255,0.35)" delay={0} />
          <FloatingShape x={width * 0.78} y={height * 0.16} size={38} color="rgba(53,208,186,0.18)" delay={600} square />
          <FloatingShape x={width * 0.85} y={height * 0.55} size={60} color="rgba(142,124,255,0.15)" delay={1200} />
          <FloatingShape x={width * 0.06} y={height * 0.68} size={34} color="rgba(255,209,102,0.28)" delay={300} square />
          <FloatingShape x={width * 0.5} y={height * 0.82} size={46} color="rgba(255,255,255,0.25)" delay={900} />
        </>
      )}
      {children}
    </View>
  );
}
