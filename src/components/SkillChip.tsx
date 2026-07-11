import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import type { SkillType } from '@/types/game';
import { AppText } from './AppText';

export const SKILL_META: Record<SkillType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  speed: { label: 'Speed', icon: 'speedometer', color: '#2F80ED' },
  attention: { label: 'Attention', icon: 'eye', color: '#FF7A59' },
  memory: { label: 'Recall', icon: 'flower', color: '#42C77B' },
  navigation: { label: 'Navigation', icon: 'map', color: '#35D0BA' },
  flexibility: { label: 'Flexibility', icon: 'git-compare', color: '#8E7CFF' },
  inhibition: { label: 'Focus Control', icon: 'hand-left', color: '#FFB84D' },
};

type Props = {
  skill: SkillType;
  labelOverride?: string;
};

export function SkillChip({ skill, labelOverride }: Props) {
  const { fs } = useTheme();
  const meta = SKILL_META[skill];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: `${meta.color}22`,
        borderRadius: radius.chip,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        alignSelf: 'flex-start',
      }}
    >
      <Ionicons name={meta.icon} size={fs(14)} color={meta.color} />
      <AppText variant="caption" weight="bold" color={meta.color}>
        {labelOverride ?? meta.label}
      </AppText>
    </View>
  );
}
