import React from 'react';
import { View } from 'react-native';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  level: number;
  color?: string;
  compact?: boolean;
};

export function LevelBadge({ level, color, compact }: Props) {
  const { colors } = useTheme();
  const tint = color ?? colors.secondary;
  return (
    <View
      accessibilityLabel={`Level ${level}`}
      style={{
        backgroundColor: `${tint}1F`,
        borderRadius: radius.chip,
        paddingHorizontal: compact ? spacing.sm : spacing.md,
        paddingVertical: spacing.xs,
        borderWidth: 1.5,
        borderColor: `${tint}55`,
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="caption" weight="extraBold" color={tint}>
        {compact ? `L${level}` : `Level ${level}`}
      </AppText>
    </View>
  );
}
