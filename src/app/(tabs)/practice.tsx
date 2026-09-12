import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { AssessmentEntryCard } from '@/components/AssessmentEntryCard';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import {
  isCatalogOpen,
  isFreePlayGameUnlocked,
  isFreePlayUnlocked,
  type FreePlayUnlockArgs,
} from '@/game/engines/catalog';
import { getStartingLevel } from '@/game/engines/difficulty';
import { getWeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

function localizedLockHint(
  unlockLevel: number,
  args: FreePlayUnlockArgs,
  t: (key: string, opts?: Record<string, unknown>) => string
): string | undefined {
  if (isFreePlayGameUnlocked(unlockLevel, args)) return undefined;
  if (!isFreePlayUnlocked(args)) return t('practice.lockOnboarding');
  if (!isCatalogOpen(args.lastDailyCompletedDate) && unlockLevel > args.globalLevel) {
    return t('practice.lockDaily');
  }
  return t('practice.lockLevel', { level: unlockLevel });
}

export default function PracticeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const settings = useGameStore((s) => s.settings);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);
  const lastAssessment = useGameStore((s) => s.lastAssessment);

  const unlock = {
    onboardingDone: settings.onboardingDone,
    lastDailyCompletedDate: progress.lastDailyCompletedDate,
    globalLevel: progress.globalLevel,
  };
  const weeklyPlan = useMemo(
    () =>
      getWeeklyChallengePlan(progress, {
        onboardingDone: settings.onboardingDone,
        lastDailyCompletedDate: progress.lastDailyCompletedDate,
        globalLevel: progress.globalLevel,
      }),
    [progress, settings.onboardingDone]
  );

  return (
    <ScreenBackground gradient={gradients.progress}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
      >
        <Reveal index={0}>
          <AppText variant="heading">{t('practice.title')}</AppText>
        </Reveal>
        <Reveal index={1}>
          <AppText variant="body" color={colors.textSoft} style={{ marginBottom: spacing.sm }}>
            {t('practice.intro')}
          </AppText>
        </Reveal>
        <Reveal index={2}>
          <WeeklyChallengeCard
            plan={weeklyPlan}
            onPress={() => router.push('/weekly')}
          />
        </Reveal>
        <Reveal index={3}>
          <AssessmentEntryCard
            lastScore={lastAssessment?.score}
            onPress={() => router.push({ pathname: '/assessment', params: { source: 'practice' } })}
          />
        </Reveal>

        <Reveal index={4}>
          <View style={{ marginTop: spacing.sm, gap: 2 }}>
            <AppText
              variant="caption"
              weight="semiBold"
              color={colors.textMuted}
              style={{ letterSpacing: 0.6 }}
            >
              {t('practice.freePlay')}
            </AppText>
            <AppText variant="caption" color={colors.textSoft}>
              {progress.lastDailyCompletedDate
                ? t('practice.catalogOpen')
                : t('practice.catalogGated')}
            </AppText>
          </View>
        </Reveal>

        {MINI_GAME_IDS.map((id, i) => {
          const game = MINI_GAMES[id];
          const mg = progress.miniGameProgress[id];
          const locked = !isFreePlayGameUnlocked(game.unlockLevel, unlock);
          return (
            <Reveal key={id} index={i + 5}>
              <ExerciseCard
                config={game}
                level={mg?.level ?? getStartingLevel(progress, settings.difficultyMode)}
                bestAccuracy={mg?.bestAccuracy}
                locked={locked}
                lockHint={localizedLockHint(game.unlockLevel, unlock, t)}
                onPress={() => {
                  startPracticeSession(id, 'practice');
                  router.push(`/play/${id}`);
                }}
              />
            </Reveal>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}
