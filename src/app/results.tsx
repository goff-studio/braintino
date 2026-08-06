import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { Reveal } from '@/components/Reveal';
import { RewardedBonusCard } from '@/components/RewardedBonusCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SessionRating } from '@/components/SessionRating';
import { SkillChip } from '@/components/SkillChip';
import { StatPill } from '@/components/StatPill';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getDailyFact } from '@/data/facts';
import { MINI_GAMES } from '@/data/miniGames';
import { difficultyChangeMessage } from '@/game/engines/difficulty';
import { consistencyLabel, createFriendlyFeedback } from '@/game/engines/scoring';
import { isSessionComplete, sessionTotals } from '@/game/engines/session';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { completionHaptic } from '@/services/haptics/haptics';
import { AdService } from '@/services/monetization/AdService';
import { useGameStore } from '@/store/useGameStore';
import type { SkillType } from '@/types/game';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const result = useGameStore((s) => s.lastResult);
  const session = useGameStore((s) => s.session);
  const progress = useGameStore((s) => s.progress);
  const lastEarnedBadges = useGameStore((s) => s.lastEarnedBadges);
  const advanceToNextGame = useGameStore((s) => s.advanceToNextGame);
  const abandonSession = useGameStore((s) => s.abandonSession);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  const isDaily = session?.mode === 'daily';
  const sessionDone = session ? isSessionComplete(session) : true;
  const nextGameId = session && !sessionDone ? session.plan[session.index + 1] : null;
  const dailyComplete = isDaily && sessionDone;
  const totals = useMemo(() => (session ? sessionTotals(session) : null), [session]);
  const dailyFact = useMemo(
    () => (dailyComplete && session ? getDailyFact(session.dateKey) : null),
    [dailyComplete, session]
  );

  useEffect(() => {
    playSound(dailyComplete ? 'daily' : 'complete');
    completionHaptic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <ScreenBackground gradient={gradients.results}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AppText variant="title">Nothing to show yet</AppText>
          <AppButton title="Back to Today" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScreenBackground>
    );
  }

  const config = MINI_GAMES[result.miniGameId];
  const skills = Object.keys(result.skillScores) as SkillType[];
  const difficultyNote =
    result.difficultyDelta !== undefined && result.difficultyDelta !== 0
      ? difficultyChangeMessage(result.level, result.level + result.difficultyDelta)
      : null;

  const goHome = async () => {
    // Interstitial only when a session was COMPLETED (never mid-session, never
    // during onboarding/first session, max one per day — AdService enforces the
    // caps). Resolves immediately when skipped, so navigation is never blocked.
    if (sessionDone && session) {
      await AdService.maybeShowInterstitialAfterSession({
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
            {dailyComplete ? 'Session Complete' : 'Exercise Complete'}
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSoft} center>
            {createFriendlyFeedback(result)}
          </AppText>
        </Reveal>

        <Reveal index={1}>
        <AppCard style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={20} color={config.color} />
            <AppText variant="bodyLarge" weight="bold">
              {config.title}
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
                Accuracy
              </AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AnimatedNumber value={result.practiceScore} variant="heading" color={colors.text} />
              <AppText variant="caption" color={colors.textSoft}>
                Practice Score
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
              value={consistencyLabel(result.consistency)}
              accessibilityLabel={`Response consistency: ${consistencyLabel(result.consistency)}`}
            />
            {result.isPersonalBest && (
              <StatPill icon="ribbon-outline" value="New personal best" variant="lime" />
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
              Milestone reached
            </AppText>
            {lastEarnedBadges.map((badge) => (
              <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Ionicons
                  name={badge.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={colors.success}
                />
                <AppText variant="body" weight="semiBold">
                  {badge.title}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {badge.description}
                </AppText>
              </View>
            ))}
          </AppCard>
          </Reveal>
        )}

        {dailyComplete && totals && (
          <Reveal index={3}>
          <AppCard style={{ gap: spacing.sm, alignItems: 'center' }}>
            <AppText variant="bodyLarge" weight="bold">
              Today’s Session
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatPill icon="checkmark-done-outline" value={`${session!.results.length} exercises`} />
              <StatPill icon="flash-outline" value={`+${totals.xp} XP`} />
              <StatPill
                icon="flame-outline"
                value={`${progress.streak}-day streak`}
                variant="lime"
                accessibilityLabel={`${progress.streak}-day streak`}
              />
            </View>
            <AppText variant="body" color={colors.textSoft} center>
              Steady work. Come back tomorrow to keep the streak going.
            </AppText>
          </AppCard>
          </Reveal>
        )}

        {dailyFact && (
          <Reveal index={4}>
          <AppCard style={{ gap: spacing.sm }}>
            <AppText
              variant="caption"
              weight="semiBold"
              color={colors.textMuted}
              style={{ letterSpacing: 1.2 }}
            >
              DID YOU KNOW
            </AppText>
            <AppText variant="body" color={colors.text}>
              {dailyFact.fact}
            </AppText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Read the source: ${dailyFact.source}`}
              onPress={() => WebBrowser.openBrowserAsync(dailyFact.link).catch(() => {})}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
            >
              <Ionicons name="open-outline" size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} style={{ flex: 1 }}>
                {dailyFact.source}
              </AppText>
            </Pressable>
          </AppCard>
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
                title={`Next: ${MINI_GAMES[nextGameId].title}`}
                icon="arrow-forward"
                onPress={() => {
                  advanceToNextGame();
                  router.replace(`/play/${nextGameId}`);
                }}
              />
              <AppButton title="Finish for now" variant="ghost" onPress={goHome} />
            </>
          ) : (
            <>
              {!isDaily && (
                <AppButton
                  title="Repeat Exercise"
                  icon="refresh"
                  variant="secondary"
                  onPress={() => {
                    startPracticeSession(result.miniGameId);
                    router.replace(`/play/${result.miniGameId}`);
                  }}
                />
              )}
              <AppButton title="Done" icon="checkmark" onPress={goHome} />
            </>
          )}
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
