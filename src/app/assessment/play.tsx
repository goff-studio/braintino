import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameHeader } from '@/components/GameHeader';
import { PauseModal } from '@/components/PauseModal';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { gameConfig } from '@/constants/gameConfig';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { parseAssessmentSource, scoreAssessment } from '@/game/engines/assessment';
import { getDifficultyForMiniGame } from '@/game/engines/difficulty';
import { FocusFlash } from '@/game/miniGames/FocusFlash';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import type { RoundsSummary } from '@/types/game';
import { todayKey } from '@/utils/date';

/**
 * Single timed Focus Snapshot using the Processing Speed engine.
 * Isolated from daily/practice XP, streaks, and adaptive level.
 */
export default function AssessmentPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useTheme();
  const completeAssessment = useGameStore((s) => s.completeAssessment);
  const startAssessment = useGameStore((s) => s.startAssessment);
  const onboardingDone = useGameStore((s) => s.settings.onboardingDone);
  const params = useLocalSearchParams<{ source?: string }>();
  const source = parseAssessmentSource(params.source);

  useEffect(() => {
    startedAtRef.current = Date.now();
    startAssessment(source);
    // One start event per play-screen mount (retake remounts; pause-restart does not).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { gameId, rounds, level } = gameConfig.assessment;
  const config = MINI_GAMES[gameId];

  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [round, setRound] = useState(1);
  const startedAtRef = useRef(0);
  const finishedRef = useRef(false);

  const difficulty = useMemo(
    () => getDifficultyForMiniGame(gameId, level, settings),
    [gameId, level, settings]
  );
  const seed = `assess-${todayKey()}-k${gameKey}`;

  const leave = () => {
    router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
  };

  const handleComplete = (summary: RoundsSummary) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationSec = (Date.now() - startedAtRef.current) / 1000;
    const result = scoreAssessment(summary, durationSec, source);
    completeAssessment(result);
    router.replace('/assessment/result');
  };

  return (
    <ScreenBackground gradient={config.gradient}>
      <Reveal index={0} style={{ flex: 1, paddingBottom: insets.bottom + spacing.md }}>
        <GameHeader
          title="Focus Snapshot"
          round={round}
          totalRounds={rounds}
          onPause={() => setPaused(true)}
          onDark
        />
        <View style={{ flex: 1 }}>
          <FocusFlash
            key={gameKey}
            difficulty={difficulty}
            paused={paused}
            seed={seed}
            roundCount={rounds}
            onComplete={handleComplete}
            onRoundChange={setRound}
          />
        </View>
      </Reveal>

      <PauseModal
        visible={paused}
        onResume={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          setRound(1);
          finishedRef.current = false;
          startedAtRef.current = Date.now();
          setGameKey((k) => k + 1);
        }}
        onExit={() => {
          setPaused(false);
          leave();
        }}
      />
    </ScreenBackground>
  );
}
