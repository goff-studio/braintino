import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { AssessmentSkillBar } from '@/components/AssessmentSkillBar';
import { palette } from '@/constants/colors';
import { RESULT_CARD_SHORT_DISCLAIMER } from '@/game/engines/assessment';
import type { AssessmentResult } from '@/types/assessment';

export const SHARE_CARD_WIDTH = 390;
export const SHARE_CARD_HEIGHT = 520;

type Props = {
  result: AssessmentResult;
};

/**
 * Share Card / 1080 (Figma 1:39). Capture target for the share sheet.
 * Field values come from the ASO contract; layout matches the approved frame.
 */
export function AssessmentShareCard({ result }: Props) {
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
        Focus Snapshot
      </AppText>

      <AppText
        variant="resultNumber"
        weight="bold"
        color={palette.deepNavy}
        style={{ fontSize: 72, lineHeight: 80 }}
        accessibilityLabel={`Score ${result.score} out of 100`}
      >
        {result.score}
      </AppText>

      <AppText variant="title" weight="semiBold" color={palette.deepNavy} style={{ fontSize: 22 }} center>
        {result.band.label}
      </AppText>
      <AppText variant="caption" color={palette.textSecondary} style={{ fontSize: 14 }} center>
        {result.band.blurb}
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
        <AssessmentSkillBar label="Focus" value={result.focus} branded />
        <AssessmentSkillBar label="Speed" value={result.speed} branded />
        <AssessmentSkillBar label="Consistency" value={result.consistency} branded />
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
          5-minute daily practice
        </AppText>
      </View>

      <AppText variant="caption" color={palette.textMuted} style={{ fontSize: 10 }} center>
        {RESULT_CARD_SHORT_DISCLAIMER}
      </AppText>
    </View>
  );
}
