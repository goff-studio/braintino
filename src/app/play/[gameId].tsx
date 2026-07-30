import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { GameHeader } from '@/components/GameHeader';
import { LevelBadge } from '@/components/LevelBadge';
import { PauseModal } from '@/components/PauseModal';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SkillChip } from '@/components/SkillChip';
import { gameConfig } from '@/constants/gameConfig';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { getDifficultyForMiniGame, getStartingLevel } from '@/game/engines/difficulty';
import { buildResult } from '@/game/engines/scoring';
import { GAME_COMPONENTS } from '@/game/miniGames';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import type { MiniGameId, RoundsSummary } from '@/types/game';
import { todayKey } from '@/utils/date';

export default function GamePlayScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();

  const progress = useGameStore((s) => s.progress);
  const completeGame = useGameStore((s) => s.completeGame);
  const abandonSession = useGameStore((s) => s.abandonSession);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  const id = gameId as MiniGameId;
  const config = MINI_GAMES[id];
  const Game = GAME_COMPONENTS[id];

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [round, setRound] = useState(1);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);

  const mgProgress = progress.miniGameProgress[id];
  const level = mgProgress?.level ?? getStartingLevel(progress, settings.difficultyMode);
  const totalRounds = gameConfig.roundsPerSession[id];

  const difficulty = useMemo(
    () => getDifficultyForMiniGame(id, level, settings, mgProgress?.lastResults ?? []),
    [id, level, settings, mgProgress?.lastResults]
  );
  const seed = `${todayKey()}-${id}-L${level}-s${mgProgress?.sessionsPlayed ?? 0}-k${gameKey}`;

  if (!config || !Game) {
    return (
      <ScreenBackground gradient={['#F5F7FC', '#F5F7FC']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AppText variant="title">Exercise not found</AppText>
          <AppButton title="Back to Today" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScreenBackground>
    );
  }

  const isDark = id === 'focus_flash';

  const handleComplete = (summary: RoundsSummary) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const minutes = Math.max(0.25, (Date.now() - startedAtRef.current) / 60000);
    const result = buildResult(id, difficulty.level, summary);
    completeGame(result, minutes);
    router.replace('/results');
  };

  const handleExit = () => {
    abandonSession();
    router.replace('/(tabs)');
  };

  return (
    <ScreenBackground gradient={config.gradient}>
      {!started ? (
        // Intro card
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + spacing.xl,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
            justifyContent: 'center',
            gap: spacing.lg,
          }}
        >
          <Reveal index={0} exit>
          <AppCard style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                backgroundColor: `${config.color}14`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={34} color={config.color} />
            </View>
            <AppText variant="title" center>
              {config.title}
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <SkillChip skill={config.skill} labelOverride={config.skillLabel} />
              <LevelBadge level={level} />
            </View>
            <AppText variant="body" color={colors.textSoft} center>
              {config.howToPlay}
            </AppText>
            {settings.difficultyMode === 'relaxed' && (
              <AppText variant="caption" color={colors.success} center>
                Relaxed pace is on — extra time per prompt.
              </AppText>
            )}
          </AppCard>
          </Reveal>
          <Reveal index={1} exit>
            <AppButton
              title="Start"
              icon="play"
              onPress={() => {
                startedAtRef.current = Date.now();
                setStarted(true);
              }}
            />
          </Reveal>
          <Reveal index={2} exit>
            <AppButton title="Back" variant="ghost" onPress={() => router.back()} />
          </Reveal>
        </View>
      ) : (
        <Reveal index={0} style={{ flex: 1, paddingBottom: insets.bottom + spacing.md }}>
          <GameHeader
            title={config.title}
            round={round}
            totalRounds={totalRounds}
            onPause={() => setPaused(true)}
            onDark={isDark}
          />
          <View style={{ flex: 1 }}>
            <Game
              key={gameKey}
              difficulty={difficulty}
              paused={paused}
              seed={seed}
              onComplete={handleComplete}
              onRoundChange={setRound}
            />
          </View>
        </Reveal>
      )}

      <PauseModal
        visible={paused}
        onResume={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          setRound(1);
          finishedRef.current = false;
          startedAtRef.current = Date.now();
          startPracticeSessionIfNeeded();
          setGameKey((k) => k + 1);
        }}
        onExit={handleExit}
      />
    </ScreenBackground>
  );

  function startPracticeSessionIfNeeded() {
    // Restart mid-daily keeps the same session; restart in practice refreshes it.
    const session = useGameStore.getState().session;
    if (!session) startPracticeSession(id);
  }
}
