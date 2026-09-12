import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import type { MiniGameConfig } from '@/types/game';
import { AppCard } from './AppCard';
import { AppText } from './AppText';
import { LevelBadge } from './LevelBadge';
import { SkillChip } from './SkillChip';

type Props = {
  config: MiniGameConfig;
  level: number;
  bestAccuracy?: number;
  locked?: boolean;
  /** Overrides the default “Level N to unlock” copy. */
  lockHint?: string;
  onPress?: () => void;
};

/** Practice-library row: icon tile, name, description, meta, chevron. */
export function ExerciseCard({ config, level, bestAccuracy, locked, lockHint, onPress }: Props) {
  const { colors, fs } = useTheme();

  return (
    <AppCard
      onPress={locked ? undefined : onPress}
      accessibilityLabel={
        locked
          ? `${config.title}, ${lockHint ?? `unlocks at level ${config.unlockLevel}`}`
          : config.title
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: locked ? colors.cardSoft : `${config.color}14`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={(locked ? 'lock-closed-outline' : config.icon) as keyof typeof Ionicons.glyphMap}
            size={fs(26)}
            color={locked ? colors.textMuted : config.color}
          />
        </View>

        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold">
            {config.title}
          </AppText>
          <AppText variant="caption" color={colors.textSoft} numberOfLines={2}>
            {config.description}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <SkillChip skill={config.skill} labelOverride={config.skillLabel} />
            {!locked && <LevelBadge level={level} compact />}
            {!locked && bestAccuracy !== undefined && bestAccuracy > 0 && (
              <AppText variant="caption" color={colors.textMuted}>
                Best {Math.round(bestAccuracy * 100)}%
              </AppText>
            )}
          </View>
        </View>

        {locked ? (
          <View style={{ alignItems: 'flex-end', maxWidth: 88 }}>
            <AppText variant="caption" weight="bold" color={colors.textMuted} style={{ textAlign: 'right' }}>
              {lockHint ?? `Level ${config.unlockLevel} to unlock`}
            </AppText>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={fs(20)} color={colors.textMuted} />
        )}
      </View>
    </AppCard>
  );
}
