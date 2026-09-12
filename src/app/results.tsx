import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { DidYouKnowCard } from '@/components/DidYouKnowCard';
import { FriendChallengeCard } from '@/components/FriendChallengeCard';
import { RateAppCard } from '@/components/RateAppCard';
import { Reveal } from '@/components/Reveal';
import { RewardedBonusCard } from '@/components/RewardedBonusCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SessionRating } from '@/components/SessionRating';
import { SkillChip } from '@/components/SkillChip';
import { StatPill } from '@/components/StatPill';
import { TomorrowPreview } from '@/components/TomorrowPreview';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getDailyFact } from '@/data/facts';
import { MINI_GAMES } from '@/data/miniGames';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { streakSaveMessage } from '@/game/engines/habitLoop';
import { newestShareStreak } from '@/game/engines/invite';
import { isSessionComplete, sessionTotals } from '@/game/engines/session';
import {
  localizedBadgeDescription,
  localizedBadgeTitle,
  localizedConsistencyLabel,
  localizedDifficultyChange,
  localizedFriendlyFeedback,
  localizedGameTitle,
} from '@/i18n/copy';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { completionHaptic } from '@/services/haptics/haptics';
import { AdService } from '@/services/monetization/AdService';
import { useGameStore } from '@/store/useGameStore';
import type { SkillType } from '@/types/game';
import { tomorrowKey } from '@/utils/date';

/**
 * How long the fact of the day holds the screen on its own before the rest of
 * the results cascade in — long enough to actually read it, short enough that
 * it never feels like a gate.
 */
const FACT_HOLD_MS = 3000;

export default function ResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, reducedMotion } = useTheme();
  const result = useGameStore((s) => s.lastResult);
  const session = useGameStore((s) => s.session);
  const progress = useGameStore((s) => s.progress);
  const lastEarnedBadges = useGameStore((s) => s.lastEarnedBadges);
  const lastAssessment = useGameStore((s) => s.lastAssessment);
  const shareStreak = newestShareStreak(lastEarnedBadges.map((b) => b.id));
  const advanceToNextGame = useGameStore((s) => s.advanceToNextGame);
  const abandonSession = useGameStore((s) => s.abandonSession);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  const isDaily = session?.mode === 'daily';
  const isWeekly = session?.mode === 'weekly';
  const isPractice = session?.mode === 'practice';
  const sessionDone = session ? isSessionComplete(session) : true;
  const nextGameId = session && !sessionDone ? session.plan[session.index + 1] : null;
  const dailyComplete = isDaily && sessionDone;
  const weeklyComplete = isWeekly && sessionDone;
  const totals = useMemo(() => (session ? sessionTotals(session) : null), [session]);
  const dailyFact = useMemo(
    () => (dailyComplete && session ? getDailyFact(session.dateKey) : null),
    [dailyComplete, session]
  );
  const tomorrowPlan = useMemo(
    () => (dailyComplete ? getTodayDailyPlan(tomorrowKey(), progress) : null),
    [dailyComplete, progress]
  );

  // The fact leads the screen — it enters on its own, and the results follow a
  // beat later. Reduced motion skips the hold and shows everything at once.
  const [showResults, setShowResults] = useState(!dailyFact || reducedMotion);

  useEffect(() => {
    if (!dailyFact || reducedMotion) return;
    const timer = setTimeout(() => setShowResults(true), FACT_HOLD_MS);
    return () => clearTimeout(timer);
  }, [dailyFact, reducedMotion]);

  useEffect(() => {
    playSound(dailyComplete ? 'daily' : 'complete');
    completionHaptic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <ScreenBackground gradient={gradients.results}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AppText variant="title">{t('results.nothing')}</AppText>
          <AppButton title={t('results.backToday')} onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScreenBackground>
    );
  }

  const config = MINI_GAMES[result.miniGameId];
  const skills = Object.keys(result.skillScores) as SkillType[];
  const difficultyNote =
    result.difficultyDelta !== undefined && result.difficultyDelta !== 0
      ? localizedDifficultyChange(result.level, result.level + result.difficultyDelta, t)
      : null;

  const goHome = async () => {
    // Interstitial only when a session was COMPLETED (never mid-session, never
    // during onboarding/first session, max one per day — AdService enforces the
    // caps). Resolves immediately when skipped, so navigation is never blocked.
    if (sessionDone && session) {
      await AdService.maybeShowInterstitialAfterSession({
        // Weekly reuses the practice slot so it does not count as a second daily.
        placement: session.mode === 'daily' ? 'after_daily_session' : 'after_practice_session',
        totalSessions: progress.totalSessions,
        dateKey: session.dateKey,
      });
    }
    abandonSession();
    router.replace('/(tabs)');
  };

  return (
    <ScreenBackground gradient={gradients.results}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
          alignItems: 'stretch',
        }}
      >
        <Reveal index={0} style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="heading" center>
            {dailyComplete
              ? t('results.sessionComplete')
              : weeklyComplete
                ? t('weekly.resultsTitle')
                : t('results.exerciseComplete')}
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSoft} center>
            {localizedFriendlyFeedback(result, t)}
          </AppText>
        </Reveal>

        {dailyFact && <DidYouKnowCard fact={dailyFact} />}

        {showResults && (
          <>
          <Reveal index={1}>
          <AppCard style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={20} color={config.color} />
              <AppText variant="bodyLarge" weight="bold">
                {localizedGameTitle(result.miniGameId, t)}
              </AppText>
            </View>
            <SessionRating rating={result.stars ?? 1} animated />

            <View style={{ flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.sm }}>
              <View style={{ alignItems: 'center' }}>
                <AnimatedNumber
                  value={Math.round(result.accuracy * 100)}
                  suffix="%"
                  variant="heading"
                  color={colors.primary}
                />
                <AppText variant="caption" color={colors.textSoft}>
                  {t('results.accuracy')}
                </AppText>
              </View>
              <View style={{ alignItems: 'center' }}>
                <AnimatedNumber value={result.practiceScore} variant="heading" color={colors.text} />
                <AppText variant="caption" color={colors.textSoft}>
                  {t('results.practiceScore')}
                </AppText>
              </View>
              <View style={{ alignItems: 'center' }}>
                <AnimatedNumber value={result.xp} prefix="+" variant="heading" color={colors.textSoft} />
                <AppText variant="caption" color={colors.textSoft}>
                  XP
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatPill
                icon="pulse-outline"
                value={localizedConsistencyLabel(result.consistency, t)}
                accessibilityLabel={t('results.consistencyA11y', {
                  label: localizedConsistencyLabel(result.consistency, t),
                })}
              />
              {result.isPersonalBest && (
                <StatPill icon="ribbon-outline" value={t('results.personalBest')} variant="lime" />
              )}
            </View>

            {difficultyNote && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons
                  name={result.difficultyDelta! > 0 ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color={result.difficultyDelta! > 0 ? colors.success : colors.textSoft}
                />
                <AppText variant="caption" color={colors.textSoft}>
                  {difficultyNote}
                </AppText>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
              {skills.map((skill) => (
                <SkillChip key={skill} skill={skill} />
              ))}
            </View>
          </AppCard>
          </Reveal>

          {lastEarnedBadges.length > 0 && (
            <Reveal index={2}>
            <AppCard style={{ gap: spacing.sm }}>
              <AppText variant="bodyLarge" weight="bold">
                {t('results.milestone')}
              </AppText>
              {lastEarnedBadges.map((badge) => (
                <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons
                    name={badge.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={colors.success}
                  />
                  <AppText variant="body" weight="semiBold">
                    {localizedBadgeTitle(badge.id, badge.title, t)}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {localizedBadgeDescription(badge.id, badge.description, t)}
                  </AppText>
                </View>
              ))}
            </AppCard>
            </Reveal>
          )}

          {shareStreak !== null && (
            <Reveal index={2}>
              <FriendChallengeCard
                surface="session_results"
                streakDays={shareStreak}
                result={lastAssessment}
              />
            </Reveal>
          )}

          {dailyComplete && totals && (
            <Reveal index={3}>
            <AppCard style={{ gap: spacing.md }}>
              <View style={{ gap: spacing.sm, alignItems: 'center' }}>
                <AppText variant="bodyLarge" weight="bold">
                  {t('daily.title')}
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatPill icon="checkmark-done-outline" value={t('common.exercisesCount', { count: session!.results.length })} />
                  <StatPill icon="flash-outline" value={t('common.xpPlus', { count: totals.xp })} />
                  <StatPill
                    icon="flame-outline"
                    value={t('common.dayStreak', { count: progress.streak })}
                    variant="lime"
                    accessibilityLabel={t('common.dayStreak', { count: progress.streak })}
                  />
                </View>
                <AppText variant="body" color={colors.textSoft} center>
                  {streakSaveMessage(progress.streak)}
                </AppText>
              </View>
              {tomorrowPlan && <TomorrowPreview plan={tomorrowPlan} />}
            </AppCard>
            </Reveal>
          )}

          {weeklyComplete && totals && (
            <Reveal index={3}>
            <AppCard style={{ gap: spacing.md }}>
              <View style={{ gap: spacing.sm, alignItems: 'center' }}>
                <AppText variant="caption" weight="semiBold" color={colors.textMuted} style={{ letterSpacing: 0.6 }}>
                  {t('weekly.kicker')}
                </AppText>
                <AppText variant="bodyLarge" weight="bold">
                  {t('weekly.resultsTitle')}
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatPill icon="checkmark-done-outline" value={t('common.exercisesCount', { count: session!.results.length })} />
                  <StatPill icon="flash-outline" value={t('common.xpPlus', { count: totals.xp })} />
                  <StatPill
                    icon="trophy-outline"
                    value={t('weekly.accuracyPill', { percent: Math.round(totals.avgAccuracy * 100) })}
                  />
                </View>
                <AppText variant="body" color={colors.textSoft} center>
                  {t('weekly.resultsBody')}
                </AppText>
              </View>
            </AppCard>
            </Reveal>
          )}

          {dailyComplete && (
            <Reveal index={4}>
              <RateAppCard />
            </Reveal>
          )}

          {dailyComplete && (
            <Reveal index={5}>
              <RewardedBonusCard />
            </Reveal>
          )}

          <Reveal index={6} style={{ gap: spacing.md }}>
            {nextGameId ? (
              <>
                <AppButton
                  title={t('results.nextGame', { title: localizedGameTitle(nextGameId, t) })}
                  icon="arrow-forward"
                  onPress={() => {
                    advanceToNextGame();
                    router.replace(`/play/${nextGameId}`);
                  }}
                />
                <AppButton title={t('results.finishForNow')} variant="ghost" onPress={goHome} />
              </>
            ) : (
              <>
                {isPractice && (
                  <AppButton
                    title={t('results.repeat')}
                    icon="refresh"
                    variant="secondary"
                    onPress={() => {
                      startPracticeSession(result.miniGameId, 'results');
                      router.replace(`/play/${result.miniGameId}`);
                    }}
                  />
                )}
                {weeklyComplete && (
                  <AppButton
                    title={t('today.freePlayExercise')}
                    icon="grid-outline"
                    variant="secondary"
                    onPress={() => {
                      abandonSession();
                      router.replace('/practice');
                    }}
                  />
                )}
                <AppButton title={t('common.done')} icon="checkmark" onPress={goHome} />
              </>
            )}
          </Reveal>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
