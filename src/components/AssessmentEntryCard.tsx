import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { gameConfig } from '@/constants/gameConfig';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onPress: () => void;
  lastScore?: number;
};

/** Today / Practice entry point for the Focus Snapshot. */
export function AssessmentEntryCard({ onPress, lastScore }: Props) {
  const { colors } = useTheme();
  return (
    <AppCard style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: colors.chipBlue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="flash-outline" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyLarge" weight="bold">
            Focus Snapshot
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            A {gameConfig.assessment.durationLabel} attention check — just for fun.
          </AppText>
        </View>
      </View>
      {lastScore !== undefined && (
        <AppText variant="caption" color={colors.textMuted}>
          Last snapshot: {lastScore}/100 · entertainment only
        </AppText>
      )}
      <AppButton
        title={lastScore !== undefined ? 'Retake Snapshot' : 'Take Focus Snapshot'}
        icon="play"
        variant="secondary"
        size="medium"
        onPress={onPress}
      />
    </AppCard>
  );
}
