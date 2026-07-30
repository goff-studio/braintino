import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBadge } from '@/data/badges';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  /** badgeId → date key earned. */
  earnedBadges: Record<string, string>;
  limit?: number;
};

/** Most recently earned milestones, newest first. */
export function MilestoneList({ earnedBadges, limit = 4 }: Props) {
  const { colors, fs } = useTheme();
  const rows = Object.entries(earnedBadges)
    .map(([id, date]) => ({ badge: getBadge(id), date }))
    .filter((r): r is { badge: NonNullable<ReturnType<typeof getBadge>>; date: string } => Boolean(r.badge))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <AppText variant="caption" color={colors.textMuted}>
        Milestones appear here as you practice.
      </AppText>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {rows.map(({ badge }) => (
        <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: colors.chipGreen,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={badge.icon as keyof typeof Ionicons.glyphMap}
              size={fs(20)}
              color={colors.success}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body" weight="semiBold">
              {badge.title}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {badge.description}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}
