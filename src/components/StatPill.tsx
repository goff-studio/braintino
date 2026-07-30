import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  /** 'lime' marks positive/achievement moments; default is the neutral blue chip. */
  variant?: 'blue' | 'lime';
  accessibilityLabel?: string;
};

export function StatPill({ icon, value, variant = 'blue', accessibilityLabel }: Props) {
  const { colors, fs } = useTheme();
  const background = variant === 'lime' ? colors.chipGreen : colors.chipBlue;
  const tint = variant === 'lime' ? colors.success : colors.primary;
  return (
    <View
      accessibilityLabel={accessibilityLabel ?? value}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: background,
        borderRadius: radius.chip,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
      }}
    >
      <Ionicons name={icon} size={fs(15)} color={tint} />
      <AppText variant="caption" weight="bold" color={colors.text}>
        {value}
      </AppText>
    </View>
  );
}
