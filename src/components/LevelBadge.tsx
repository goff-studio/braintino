import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  level: number;
  compact?: boolean;
};

export function LevelBadge({ level, compact }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={t('common.level', { level })}
      style={{
        backgroundColor: colors.chipBlue,
        borderRadius: radius.chip,
        paddingHorizontal: compact ? spacing.sm : spacing.md,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="caption" weight="bold" color={colors.text}>
        {compact ? t('common.levelCompact', { level }) : t('common.level', { level })}
      </AppText>
    </View>
  );
}
