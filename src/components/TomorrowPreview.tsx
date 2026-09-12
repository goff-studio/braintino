import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import type { DailyPlan } from '@/game/engines/dailyTraining';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  plan: DailyPlan;
  /** Dark hero card vs. light results card. */
  tone?: 'dark' | 'light';
};

/** Tomorrow’s session chips — used after daily completion (home + results). */
export function TomorrowPreview({ plan, tone = 'light' }: Props) {
  const { colors } = useTheme();
  const dark = tone === 'dark';
  const titleColor = dark ? colors.textOnDark : colors.text;
  const mutedColor = dark ? colors.textOnDarkSoft : colors.textSoft;
  const chipBg = dark ? 'rgba(255,255,255,0.12)' : colors.chipBlue;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ gap: 2 }}>
        <AppText variant="caption" weight="semiBold" color={mutedColor} style={{ letterSpacing: 0.6 }}>
          TOMORROW
        </AppText>
        <AppText variant="bodyLarge" weight="bold" color={titleColor}>
          {plan.title}
        </AppText>
        <AppText variant="caption" color={mutedColor}>
          3 exercises · about 5 minutes
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {plan.games.map((id) => {
          const game = MINI_GAMES[id];
          return (
            <View
              key={id}
              style={{
                flex: 1,
                alignItems: 'center',
                gap: 4,
                backgroundColor: chipBg,
                borderRadius: 16,
                paddingVertical: spacing.sm,
              }}
            >
              <Ionicons
                name={game.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={dark ? colors.textOnDark : colors.primary}
              />
              <AppText variant="caption" weight="semiBold" color={mutedColor} center>
                {game.shortTitle}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
