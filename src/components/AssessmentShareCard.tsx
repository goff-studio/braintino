import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { AssessmentSkillBar } from '@/components/AssessmentSkillBar';
import { palette } from '@/constants/colors';
import { localizedAssessmentBand } from '@/i18n/copy';
import type { AssessmentResult } from '@/types/assessment';

export const SHARE_CARD_WIDTH = 390;
export const SHARE_CARD_HEIGHT = 520;

type Props = {
  result: AssessmentResult;
};

type OffscreenProps = {
  result: AssessmentResult;
  cardRef: React.Ref<View>;
};

/**
 * Share Card / 1080 (Figma 1:39). Capture target for the share sheet.
 * Field values come from the ASO contract; layout matches the approved frame.
 */
export function AssessmentShareCard({ result }: Props) {
  const { t } = useTranslation();
  const band = localizedAssessmentBand(result.score, t);
  return (
    <View
      collapsable={false}
      style={{
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        backgroundColor: palette.softBlue,
        borderRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          accessibilityLabel="Braintino"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: palette.brandBlue,
          }}
        />
        <AppText variant="body" weight="bold" color={palette.deepNavy} style={{ fontSize: 16 }}>
          Braintino
        </AppText>
      </View>

      <AppText variant="caption" weight="medium" color={palette.textMuted} style={{ fontSize: 13 }}>
        {t('assessment.name')}
      </AppText>

      <AppText
        variant="resultNumber"
        weight="bold"
        color={palette.deepNavy}
        style={{ fontSize: 72, lineHeight: 80 }}
        accessibilityLabel={t('common.scoreOutOf100', { score: result.score })}
      >
        {result.score}
      </AppText>

      <AppText variant="title" weight="semiBold" color={palette.deepNavy} style={{ fontSize: 22 }} center>
        {band.label}
      </AppText>
      <AppText variant="caption" color={palette.textSecondary} style={{ fontSize: 14 }} center>
        {band.blurb}
      </AppText>

      <View
        style={{
          width: '100%',
          backgroundColor: palette.cardWhite,
          borderRadius: 16,
          padding: 16,
          gap: 12,
        }}
      >
        <AssessmentSkillBar label={t('assessment.focus')} value={result.focus} branded />
        <AssessmentSkillBar label={t('assessment.speed')} value={result.speed} branded />
        <AssessmentSkillBar label={t('assessment.consistency')} value={result.consistency} branded />
      </View>

      <View
        style={{
          backgroundColor: palette.lime,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <AppText variant="caption" weight="semiBold" color={palette.deepNavy} style={{ fontSize: 12 }}>
          {t('assessment.dailyChip')}
        </AppText>
      </View>

      <AppText variant="caption" color={palette.textMuted} style={{ fontSize: 10 }} center>
        {t('assessment.cardDisclaimer')}
      </AppText>
    </View>
  );
}

/** Off-screen capture host so in-app layouts stay the Figma frames. */
export function OffscreenAssessmentShareCard({ result, cardRef }: OffscreenProps) {
  return (
    <View
      ref={cardRef}
      collapsable={false}
      style={{
        position: 'absolute',
        left: -SHARE_CARD_WIDTH - 40,
        top: 0,
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        pointerEvents: 'none',
      }}
    >
      <AssessmentShareCard result={result} />
    </View>
  );
}
