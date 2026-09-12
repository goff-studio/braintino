import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { AppCard } from '@/components/AppCard';
import { DIFFICULTY_PACE_LABEL } from '@/data/personalPlan';
import { MINI_GAMES } from '@/data/miniGames';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { PLAN_DISCLAIMER, type PersonalPlan } from '@/types/plan';

type Props = {
  plan: PersonalPlan;
  /** Today / Profile: compact identity. Onboarding uses the fuller default. */
  compact?: boolean;
};

/** Stored personal plan — entertainment / self-insight only. */
export function PersonalPlanCard({ plan, compact }: Props) {
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
          <Ionicons name="map-outline" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="caption" weight="semiBold" color={colors.textMuted} style={{ letterSpacing: 0.8 }}>
            YOUR 5-MIN PLAN
          </AppText>
          <AppText variant="bodyLarge" weight="bold">
            {plan.title}
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            {DIFFICULTY_PACE_LABEL[plan.difficultyMode]} · change anytime in Profile
          </AppText>
        </View>
      </View>
      <AppText variant="body" color={colors.textSoft}>
        {plan.focusCopy}
      </AppText>
      {!compact && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {plan.recommendedGames.map((id) => {
            const game = MINI_GAMES[id];
            return (
              <View
                key={id}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: colors.chipBlue,
                  borderRadius: 16,
                  paddingVertical: spacing.sm,
                }}
              >
                <Ionicons
                  name={game.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={colors.primary}
                />
                <AppText variant="caption" weight="semiBold" color={colors.textSoft} center>
                  {game.shortTitle}
                </AppText>
              </View>
            );
          })}
        </View>
      )}
      <AppText variant="caption" color={colors.textMuted}>
        {PLAN_DISCLAIMER}
      </AppText>
    </AppCard>
  );
}
