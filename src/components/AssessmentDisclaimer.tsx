import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { ASSESSMENT_DISCLAIMER } from '@/game/engines/assessment';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  compact?: boolean;
};

/** Entertainment-only notice. Never imply a medical or diagnostic result. */
export function AssessmentDisclaimer({ compact }: Props) {
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
        {ASSESSMENT_DISCLAIMER}
      </AppText>
    </View>
  );
}
