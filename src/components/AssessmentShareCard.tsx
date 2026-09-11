import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { ASSESSMENT_DISCLAIMER, RESULT_CARD_FIELDS } from '@/game/engines/assessment';
import { useTheme } from '@/hooks/useTheme';
import type { AssessmentResult } from '@/types/assessment';

type Props = {
  result: AssessmentResult;
};

/**
 * PLACEHOLDER capture target for the share sheet.
 *
 * Do not polish this layout — ASO/Figma will lock the visual card later.
 * Share plumbing (`shareAssessmentCard`) captures whatever is rendered here,
 * so a designed card can replace this view without changing field names.
 *
 * Field contract: `docs/assessment-result-card.md` and `RESULT_CARD_FIELDS`.
 */
export function AssessmentShareCard({ result }: Props) {
  const { colors } = useTheme();
  const fields = RESULT_CARD_FIELDS(result);
  return (
    <View
      collapsable={false}
      style={{
        gap: spacing.sm,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <AppText variant="caption" color={colors.textMuted}>
        PLACEHOLDER result card — visual design pending Figma
      </AppText>
      {fields.map((row) => (
        <AppText key={row.key} variant="body">
          {row.key}: {row.value}
        </AppText>
      ))}
      <AppText variant="caption" color={colors.textMuted}>
        disclaimer: {ASSESSMENT_DISCLAIMER}
      </AppText>
    </View>
  );
}
