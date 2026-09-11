import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark } from '@/components/BrandMark';
import { AppText } from '@/components/AppText';
import { palette } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import type { AssessmentResult } from '@/types/assessment';

type Props = {
  result: AssessmentResult;
};

const SKILLS: { key: 'focus' | 'speed' | 'consistency'; label: string }[] = [
  { key: 'focus', label: 'Focus' },
  { key: 'speed', label: 'Speed' },
  { key: 'consistency', label: 'Consistency' },
];

/**
 * Branded image used on the result screen and captured for the share sheet.
 * Hardcoded brand colors so the shared card stays on-model regardless of
 * accessibility theme.
 */
export function AssessmentShareCard({ result }: Props) {
  return (
    <View
      collapsable={false}
      style={{
        borderRadius: radius.cardLarge,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <LinearGradient
        colors={[palette.brandBlue, palette.deepNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <BrandMark size={28} color="#FFFFFF" sparkColor={palette.lime} />
          <View>
            <AppText variant="caption" weight="semiBold" color="rgba(255,255,255,0.7)" style={{ letterSpacing: 1.2 }}>
              BRAINTINO
            </AppText>
            <AppText variant="body" weight="bold" color="#FFFFFF">
              Focus Snapshot
            </AppText>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="resultNumber" color="#FFFFFF" accessibilityLabel={`Score ${result.score} out of 100`}>
            {result.score}
          </AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.7)">
            out of 100
          </AppText>
          <View
            style={{
              backgroundColor: palette.lime,
              borderRadius: 999,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            <AppText variant="caption" weight="bold" color={palette.deepNavy}>
              {result.band.label}
            </AppText>
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          {SKILLS.map((skill) => {
            const value = result[skill.key];
            return (
              <View key={skill.key} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="caption" weight="semiBold" color="rgba(255,255,255,0.8)">
                    {skill.label}
                  </AppText>
                  <AppText variant="caption" weight="bold" color="#FFFFFF">
                    {value}
                  </AppText>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${value}%`,
                      height: '100%',
                      backgroundColor: palette.lime,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <AppText variant="caption" color="rgba(255,255,255,0.55)" center>
          Entertainment only · Not a diagnosis
        </AppText>
      </LinearGradient>
    </View>
  );
}
