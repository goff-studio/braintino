import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import type { SkillType } from '@/types/game';
import { AppText } from './AppText';

/** Per-skill metadata. `color` is used by the Skill Balance bars on Progress. */
export const SKILL_META: Record<SkillType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  speed: { label: 'Speed', icon: 'speedometer-outline', color: '#0067B1' },
  attention: { label: 'Attention', icon: 'eye-outline', color: '#B26A00' },
  memory: { label: 'Memory', icon: 'layers-outline', color: '#3E7C17' },
  navigation: { label: 'Spatial', icon: 'navigate-outline', color: '#0E7C86' },
  flexibility: { label: 'Flexibility', icon: 'git-branch-outline', color: '#3B5BA5' },
  inhibition: { label: 'Focus Control', icon: 'hand-left-outline', color: '#4B6478' },
};

type Props = {
  skill: SkillType;
  labelOverride?: string;
};

export function SkillChip({ skill, labelOverride }: Props) {
  const { colors, fs } = useTheme();
  const meta = SKILL_META[skill];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.chipBlue,
        borderRadius: radius.chip,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        alignSelf: 'flex-start',
      }}
    >
      <Ionicons name={meta.icon} size={fs(14)} color={colors.primary} />
      <AppText variant="caption" weight="semiBold" color={colors.primary}>
        {labelOverride ?? meta.label}
      </AppText>
    </View>
  );
}
