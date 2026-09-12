import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import type { WeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import { localizedGameShort, localizedWeeklyBlurb, localizedWeeklyTitle, localizedWeeklyTwist } from '@/i18n/copy';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  plan: WeeklyChallengePlan;
  onPress: () => void;
  /** Dark hero treatment after today’s session is done. */
  tone?: 'light' | 'dark';
};

/** Today / Practice entry for this week’s 3-exercise challenge. */
export function WeeklyChallengeCard({ plan, onPress, tone = 'light' }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dark = tone === 'dark';
  const titleColor = dark ? colors.textOnDark : colors.text;
  const mutedColor = dark ? colors.textOnDarkSoft : colors.textSoft;

  return (
    <AppCard hero={dark} style={{ gap: spacing.md }}>
      <View style={{ gap: 2 }}>
        <AppText
          variant="caption"
          weight="semiBold"
          color={mutedColor}
          style={{ letterSpacing: 0.6 }}
        >
          {t('weekly.kicker')}
        </AppText>
        <AppText variant="bodyLarge" weight="bold" color={titleColor}>
          {localizedWeeklyTitle(plan.twist, t)}
        </AppText>
        <AppText variant="caption" color={mutedColor}>
          {plan.completed
            ? t('weekly.completed')
            : t('weekly.blurbMeta', { blurb: localizedWeeklyBlurb(plan.twist, t) })}
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
                backgroundColor: dark ? 'rgba(255,255,255,0.12)' : colors.chipBlue,
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
                {localizedGameShort(id, t)}
              </AppText>
            </View>
          );
        })}
      </View>

      <AppText variant="caption" color={mutedColor}>
        {localizedWeeklyTwist(plan.twist, t)}
        {plan.completed ? '' : ` · ${t('weekly.daysLeft', { count: plan.daysLeft })}`}
      </AppText>

      <AppButton
        title={plan.completed ? t('weekly.playAgain') : t('weekly.start')}
        icon="trophy-outline"
        variant={dark ? 'primary' : 'secondary'}
        tone={dark && !plan.completed ? 'lime' : undefined}
        size="medium"
        onPress={onPress}
      />
    </AppCard>
  );
}
