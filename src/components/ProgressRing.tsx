import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  /** 0..1 */
  progress: number;
  size?: number;
  thickness?: number;
  color?: string;
  label?: string;
};

/**
 * Circular progress built from two rotated half-circle borders — no SVG
 * dependency, cheap to render.
 */
export function ProgressRing({ progress, size = 84, thickness = 10, color, label }: Props) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const ringColor = color ?? colors.primary;
  const half = size / 2;

  const halfCircle = (rotate: number, clip: 'left' | 'right', tint: string) => (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: clip === 'left' ? 0 : half,
          width: half,
          height: size,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: clip === 'left' ? 0 : -half,
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: thickness,
            borderColor: tint,
          }}
        />
      </View>
    </View>
  );

  const firstHalf = Math.min(clamped, 0.5) * 360;
  const secondHalf = Math.max(0, clamped - 0.5) * 360;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={label ? `${label}: ${Math.round(clamped * 100)}%` : undefined}
    >
      {/* track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: thickness,
          borderColor: `${ringColor}26`,
        }}
      />
      {/* right half sweeps 0..180deg */}
      {clamped > 0 && halfCircle(firstHalf - 180, 'right', ringColor)}
      {/* left half sweeps 180..360deg */}
      {clamped > 0.5 && halfCircle(secondHalf, 'left', ringColor)}
      {label !== undefined && (
        <AppText variant="bodyLarge" weight="extraBold">
          {label}
        </AppText>
      )}
    </View>
  );
}
