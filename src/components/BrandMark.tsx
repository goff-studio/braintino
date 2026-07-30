import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  size?: number;
  color?: string;
  sparkColor?: string;
};

/**
 * The Braintino mark: an open focus ring with a lime spark in the gap.
 * Procedural (plain Views) like ProgressRing — no SVG dependency.
 */
export function BrandMark({ size = 40, color, sparkColor }: Props) {
  const { colors } = useTheme();
  const ring = color ?? colors.primary;
  const spark = sparkColor ?? colors.accent;
  const thickness = Math.max(3, Math.round(size * 0.11));
  const dotSize = Math.max(6, Math.round(thickness * 1.6));
  const radius = (size - thickness) / 2;
  // Gap opens toward the top-right diagonal; the spark sits in its center.
  const offset = radius * Math.SQRT1_2;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel="Braintino">
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: ring,
          borderTopColor: 'transparent',
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size / 2 + offset - dotSize / 2,
          top: size / 2 - offset - dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: spark,
          borderWidth: 1,
          borderColor: 'rgba(11,31,53,0.2)',
        }}
      />
    </View>
  );
}
