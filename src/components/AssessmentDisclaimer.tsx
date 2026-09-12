import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  compact?: boolean;
};

/** Entertainment-only notice. Never imply a medical or diagnostic result. */
export function AssessmentDisclaimer({ compact }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingHorizontal: compact ? 0 : spacing.xs,
      }}
    >
      <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} style={{ marginTop: 1 }} />
      <AppText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
        {t('assessment.disclaimer')}
      </AppText>
    </View>
  );
}
