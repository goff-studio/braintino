import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { gameConfig } from '@/constants/gameConfig';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import {
  advanceCalibration,
  calibrationBlockMessage,
  calibrationPlacement,
  createCalibration,
} from '@/game/engines/calibration';
import { difficultyTierLabel, getDifficultyForMiniGame } from '@/game/engines/difficulty';
import { FocusFlash } from '@/game/miniGames/FocusFlash';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import type { RoundsSummary } from '@/types/game';
import { todayKey } from '@/utils/date';

/**
 * Onboarding warm-up: short bursts of Processing Speed on a rising
 * staircase (see /src/game/engines/calibration). Self-contained — no
 * session, XP, or badge scoring; the outcome is only the starting level.
 */
export default function CalibrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();
  const completeCalibration = useGameStore((s) => s.completeCalibration);

  const { gameId, roundsPerBlock, maxBlocks } = gameConfig.calibration;
  const config = MINI_GAMES[gameId];

  const [calibration, setCalibration] = useState(() => createCalibration(settings.difficultyMode));
  const [phase, setPhase] = useState<'playing' | 'interlude' | 'done'>('playing');
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(1);

  const difficulty = useMemo(
    () => getDifficultyForMiniGame(gameId, calibration.level, settings),
    [gameId, calibration.level, settings]
  );
  const lastOutcome = calibration.outcomes[calibration.outcomes.length - 1];
  const placement = calibrationPlacement(calibration, settings.difficultyMode);

  // Interludes narrate the step and roll into the next burst on their own.
  useEffect(() => {
    if (phase !== 'interlude') return;
    const timer = setTimeout(() => setPhase('playing'), 1600);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleBlockComplete = (summary: RoundsSummary) => {
    const next = advanceCalibration(calibration, summary);
    setCalibration(next);
    setRound(1);
    setPhase(next.done ? 'done' : 'interlude');
  };

  const finish = (target: '/(tabs)') => {
    if (calibration.blocksPlayed > 0) {
      completeCalibration(placement, calibration.blocksPlayed);
    }
    router.replace(target);
  };

  return (
    <ScreenBackground gradient={config.gradient}>
      {phase === 'playing' && (
        <Reveal index={0} style={{ flex: 1, paddingBottom: insets.bottom + spacing.md }}>
          <GameHeader
            title={`Warm-up ${Math.min(calibration.blocksPlayed + 1, maxBlocks)} of ${maxBlocks}`}
            round={round}
            totalRounds={roundsPerBlock}
            onPause={() => setPaused(true)}
            onDark
          />
          <View style={{ flex: 1 }}>
            <FocusFlash
              key={calibration.blocksPlayed}
              difficulty={difficulty}
              paused={paused}
              seed={`calib-${todayKey()}-b${calibration.blocksPlayed}-L${calibration.level}`}
              roundCount={roundsPerBlock}
              onComplete={handleBlockComplete}
              onRoundChange={setRound}
            />
          </View>
        </Reveal>
      )}

      {phase === 'interlude' && lastOutcome && (
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
            justifyContent: 'center',
            gap: spacing.lg,
          }}
        >
          <Reveal index={0} exit>
            <AppCard style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
              <Ionicons
                name={lastOutcome === 'fail' ? 'trending-down' : lastOutcome === 'hold' ? 'remove' : 'trending-up'}
                size={34}
                color={colors.primary}
              />
              <AppText variant="title" center>
                {calibrationBlockMessage(lastOutcome)}
              </AppText>
              <LevelBadge level={calibration.level} />
            </AppCard>
          </Reveal>
        </View>
      )}

      {phase === 'done' && (
        <View
          style={{
            flex: 1,
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
                  backgroundColor: colors.chipBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={34} color={colors.primary} />
              </View>
              <AppText variant="title" center>
                Level found
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                <LevelBadge level={placement} />
                <AppText variant="body" weight="bold" color={colors.textSoft}>
                  {difficultyTierLabel(placement)}
                </AppText>
              </View>
              <AppText variant="body" color={colors.textSoft} center>
                Every exercise starts near this level and keeps adapting as you play. Accuracy
                first — the difficulty follows you.
              </AppText>
            </AppCard>
          </Reveal>
          <Reveal index={1} exit>
            <AppButton title="Start Training" icon="arrow-forward" onPress={() => finish('/(tabs)')} />
          </Reveal>
        </View>
      )}

      <PauseModal
        visible={paused}
        onResume={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          setRound(1);
          setCalibration(createCalibration(settings.difficultyMode));
          setPhase('playing');
        }}
        onExit={() => {
          setPaused(false);
          finish('/(tabs)');
        }}
      />
    </ScreenBackground>
  );
}
