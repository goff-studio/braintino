import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { localizedGameDescription, localizedGameTitle, localizedSkillLabel } from '@/i18n/copy';
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
  const { t } = useTranslation();
  const { colors, fs } = useTheme();
  const title = localizedGameTitle(config.id, t);

  return (
    <AppCard
      onPress={locked ? undefined : onPress}
      accessibilityLabel={
        locked
          ? `${title}, ${lockHint ?? t('practice.unlocksAtLevel', { level: config.unlockLevel })}`
          : title
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
            {title}
          </AppText>
          <AppText variant="caption" color={colors.textSoft} numberOfLines={2}>
            {localizedGameDescription(config.id, t)}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <SkillChip skill={config.skill} labelOverride={localizedSkillLabel(config.skill, t)} />
            {!locked && <LevelBadge level={level} compact />}
            {!locked && bestAccuracy !== undefined && bestAccuracy > 0 && (
              <AppText variant="caption" color={colors.textMuted}>
                {t('practice.bestAccuracy', { percent: Math.round(bestAccuracy * 100) })}
              </AppText>
            )}
          </View>
        </View>

        {locked ? (
          <View style={{ alignItems: 'flex-end', maxWidth: 88 }}>
            <AppText variant="caption" weight="bold" color={colors.textMuted} style={{ textAlign: 'right' }}>
              {lockHint ?? t('practice.lockLevel', { level: config.unlockLevel })}
            </AppText>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={fs(20)} color={colors.textMuted} />
        )}
      </View>
    </AppCard>
  );
}
