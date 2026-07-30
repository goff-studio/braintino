import React from 'react';
import { View } from 'react-native';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  level: number;
  compact?: boolean;
};

export function LevelBadge({ level, compact }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`Level ${level}`}
      style={{
        backgroundColor: colors.chipBlue,
        borderRadius: radius.chip,
        paddingHorizontal: compact ? spacing.sm : spacing.md,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="caption" weight="bold" color={colors.text}>
        {compact ? `L${level}` : `Level ${level}`}
      </AppText>
    </View>
  );
}
