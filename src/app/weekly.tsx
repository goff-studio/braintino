import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { LevelBadge } from '@/components/LevelBadge';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SkillChip } from '@/components/SkillChip';
import { gradients } from '@/constants/colors';
import { spacing, tapTarget } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { getStartingLevel } from '@/game/engines/difficulty';
import { getWeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import { localizedGameTitle, localizedSkillLabel, localizedWeeklyTitle, localizedWeeklyTwist } from '@/i18n/copy';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

export default function WeeklyChallengeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();
  const session = useGameStore((s) => s.session);
  const progress = useGameStore((s) => s.progress);
  const startWeeklySession = useGameStore((s) => s.startWeeklySession);

  const fallback = useMemo(
    () =>
      getWeeklyChallengePlan(progress, {
        onboardingDone: settings.onboardingDone,
        lastDailyCompletedDate: progress.lastDailyCompletedDate,
        globalLevel: progress.globalLevel,
      }),
    [progress, settings.onboardingDone]
  );

  const plan = session?.mode === 'weekly' ? session.plan : fallback.games;
  const title = localizedWeeklyTitle(fallback.twist, t);
  const twist = session?.twist ?? fallback.twist;

  return (
    <ScreenBackground gradient={gradients.daily}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <Reveal index={0} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
            style={{
              width: tapTarget.min,
              height: tapTarget.min,
              borderRadius: tapTarget.min / 2,
              backgroundColor: colors.trackFaint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <AppText variant="title">{title}</AppText>
            <AppText variant="body" color={colors.textSoft}>
              {t('weekly.headerMeta', { twist: localizedWeeklyTwist(twist, t) })}
            </AppText>
          </View>
        </Reveal>

        <View style={{ gap: spacing.sm }}>
          {plan.map((id, index) => {
            const game = MINI_GAMES[id];
            const level =
              progress.miniGameProgress[id]?.level ??
              getStartingLevel(progress, settings.difficultyMode);
            return (
              <Reveal key={id} index={index + 1} style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.md }}>
                <View style={{ alignItems: 'center', width: 32 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.secondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppText variant="body" weight="bold" color="#FFFFFF">
                      {index + 1}
                    </AppText>
                  </View>
                  {index < plan.length - 1 && (
                    <View style={{ flex: 1, width: 3, borderRadius: 2, backgroundColor: colors.trackFaint, marginVertical: 4 }} />
                  )}
                </View>
                <AppCard style={{ flex: 1, marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        backgroundColor: `${game.color}14`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={game.icon as keyof typeof Ionicons.glyphMap} size={28} color={game.color} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="bodyLarge" weight="bold">
                        {localizedGameTitle(id, t)}
                      </AppText>
                      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                        <SkillChip skill={game.skill} labelOverride={localizedSkillLabel(game.skill, t)} />
                        <LevelBadge level={level} compact />
                        <AppText variant="caption" color={colors.textSoft}>
                          ~{Math.round((game.baseDurationSec / 60) * 10) / 10}m
                        </AppText>
                      </View>
                    </View>
                  </View>
                </AppCard>
              </Reveal>
            );
          })}
        </View>

        <Reveal index={4}>
          <AppButton
            title={t('weekly.begin')}
            icon="trophy-outline"
            onPress={() => {
              const s =
                session?.mode === 'weekly' && session.results.length === 0
                  ? session
                  : startWeeklySession();
              router.push(`/play/${s.plan[0]}`);
            }}
          />
        </Reveal>
        <Reveal index={5}>
          <AppText variant="caption" color={colors.textSoft} center>
            {t('weekly.footer')}
          </AppText>
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
