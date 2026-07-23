import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { RewardedBonusCard } from '@/components/RewardedBonusCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SkillChip } from '@/components/SkillChip';
import { StarRating } from '@/components/StarRating';
import { TinoMascot } from '@/components/TinoMascot';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { createFriendlyFeedback } from '@/game/engines/scoring';
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
  const advanceToNextGame = useGameStore((s) => s.advanceToNextGame);
  const abandonSession = useGameStore((s) => s.abandonSession);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  const isDaily = session?.mode === 'daily';
  const sessionDone = session ? isSessionComplete(session) : true;
  const nextGameId = session && !sessionDone ? session.plan[session.index + 1] : null;
  const dailyComplete = isDaily && sessionDone;
  const totals = useMemo(() => (session ? sessionTotals(session) : null), [session]);

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
          <AppButton title="Back Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScreenBackground>
    );
  }

  const config = MINI_GAMES[result.miniGameId];
  const skills = Object.keys(result.skillScores) as SkillType[];

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
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
          alignItems: 'stretch',
        }}
      >
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <TinoMascot size={130} mood="cheer" />
          <AppText variant="heading" center>
            {dailyComplete ? 'Boost Complete!' : 'Well Done!'}
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSoft} center>
            {createFriendlyFeedback(result)}
          </AppText>
        </View>

        <AppCard style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={20} color={config.color} />
            <AppText variant="bodyLarge" weight="extraBold">
              {config.title}
            </AppText>
          </View>
          <StarRating stars={result.stars} size={40} animated />
          <View style={{ flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.sm }}>
            <View style={{ alignItems: 'center' }}>
              <AnimatedNumber value={result.xp} prefix="+" variant="display" color={colors.primary} />
              <AppText variant="caption" color={colors.textSoft}>
                XP
              </AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AnimatedNumber value={result.coins} prefix="+" variant="display" color="#E5A33C" />
              <AppText variant="caption" color={colors.textSoft}>
                Coins
              </AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="display" color={colors.accent}>
                {Math.round(result.accuracy * 100)}%
              </AppText>
              <AppText variant="caption" color={colors.textSoft}>
                Accuracy
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
            {skills.map((skill) => (
              <SkillChip key={skill} skill={skill} />
            ))}
          </View>
        </AppCard>

        {dailyComplete && totals && (
          <View><AppCard style={{ gap: spacing.sm, alignItems: 'center' }}>
              <AppText variant="bodyLarge" weight="extraBold">
                Today’s Boost Summary
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.xl }}>
                <AppText variant="body" color={colors.textSoft}>
                  ⭐ {totals.stars} stars
                </AppText>
                <AppText variant="body" color={colors.textSoft}>
                  +{totals.xp} XP
                </AppText>
                <AppText variant="body" color={colors.textSoft}>
                  🔥 {progress.streak}-day streak
                </AppText>
              </View>
              <AppText variant="body" color={colors.textSoft} center>
                Tino is proud of your progress. See you tomorrow!
              </AppText>
            </AppCard>
          </View>
        )}

        {dailyComplete && <RewardedBonusCard />}

        <View style={{ gap: spacing.md }}>
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
                  title="Practice Again"
                  icon="refresh"
                  variant="secondary"
                  onPress={() => {
                    startPracticeSession(result.miniGameId);
                    router.replace(`/play/${result.miniGameId}`);
                  }}
                />
              )}
              <AppButton title="Back Home" icon="home" onPress={goHome} />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
