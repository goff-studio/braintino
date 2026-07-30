import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { gameConfig } from '@/constants/gameConfig';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { rngFromString, sample, shuffle } from '@/utils/random';
import { RuleBanner } from './RuleBanner';
import { usePausableTimeout, usePhase, useReactionClock, useRoundTracker, type MiniGameProps } from './shared';

// City waypoints in a single muted accent; the lit state uses brand blue so
// order — not color — is what the player encodes.
const LIT_COLOR = '#0067B1';
const LANDMARKS: { name: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { name: 'Home', icon: 'home', color: '#0E7C86' },
  { name: 'Office', icon: 'business', color: '#0E7C86' },
  { name: 'Café', icon: 'cafe', color: '#0E7C86' },
  { name: 'Park', icon: 'leaf', color: '#0E7C86' },
  { name: 'Station', icon: 'train', color: '#0E7C86' },
  { name: 'Gym', icon: 'barbell', color: '#0E7C86' },
  { name: 'Library', icon: 'library', color: '#0E7C86' },
  { name: 'Market', icon: 'cart', color: '#0E7C86' },
  { name: 'Bank', icon: 'card', color: '#0E7C86' },
];

/** Rotate a 3x3 grid index 90° clockwise. */
function rotateIndex(i: number): number {
  const row = Math.floor(i / 3);
  const col = i % 3;
  return col * 3 + (2 - row);
}

export function RouteRecall({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.route_recall;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const routeLength = difficulty.routeLength ?? 3;
  const rotateMap = difficulty.rotateMap ?? false;

  const [roundIndex, setRoundIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'intro' | 'preview' | 'rotate' | 'recall' | 'roundDone'>('intro');
  const [previewStep, setPreviewStep] = useState(-1);
  const [inputPos, setInputPos] = useState(0);
  const [stepMistakes, setStepMistakes] = useState(0);
  const [tapped, setTapped] = useState<{ cell: number; kind: 'correct' | 'wrong' } | null>(null);
  const [rotated, setRotated] = useState(false);

  // Landmark layout for this round (9 cells) and the route through it.
  const { layout, route, decoyStep } = useMemo(() => {
    const rng = rngFromString(`${seed}-rr-${roundIndex}`);
    const layout = shuffle(rng, LANDMARKS);
    const route = sample(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8], routeLength);
    // A decoy landmark briefly glows gray mid-preview on higher levels.
    const remaining = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => !route.includes(c));
    const decoyStep = difficulty.distractors > 0 ? { cell: remaining[Math.floor(rng() * remaining.length)], afterStep: Math.floor(routeLength / 2) } : null;
    return { layout, route, decoyStep };
  }, [seed, roundIndex, routeLength, difficulty.distractors]);

  /** Maps a visual cell position to the original layout cell (for rotation). */
  const displayCell = (visualIndex: number): number =>
    rotated ? rotateIndex(visualIndex) : visualIndex;

  useEffect(() => {
    onRoundChange?.(roundIndex + 1);
  }, [roundIndex, onRoundChange]);

  usePausableTimeout(
    () => {
      setRotated(false);
      setPreviewStep(0);
      setPhase('preview');
    },
    phase === 'intro' ? 900 : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (previewStep < route.length - 1) {
        setPreviewStep((s) => s + 1);
        setPhase('preview');
      } else if (rotateMap) {
        setPreviewStep(-1);
        setPhase('rotate');
      } else {
        setPreviewStep(-1);
        setInputPos(0);
        setStepMistakes(0);
        clock.start();
        setPhase('recall');
      }
    },
    phase === 'preview' ? difficulty.previewMs : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      setRotated(true);
      setInputPos(0);
      setStepMistakes(0);
      clock.start();
      setPhase('recall');
    },
    phase === 'rotate' ? 1100 : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (roundIndex < totalRounds - 1) {
        setRoundIndex((r) => r + 1);
        setTapped(null);
        setPhase('intro');
      } else {
        onComplete(tracker.summary(totalRounds, true));
      }
    },
    phase === 'roundDone' ? 1000 : null,
    paused,
    token
  );

  const handleTap = (originalCell: number) => {
    if (phase !== 'recall') return;
    const correct = originalCell === route[inputPos];
    tracker.record(correct, clock.elapsed());
    clock.start();
    setTapped({ cell: originalCell, kind: correct ? 'correct' : 'wrong' });
    if (correct) {
      playSound('correct');
      successHaptic();
      if (inputPos >= route.length - 1) setPhase('roundDone');
      else {
        setInputPos((p) => p + 1);
        setStepMistakes(0);
      }
    } else {
      playSound('wrong');
      warningHaptic();
      const mistakes = stepMistakes + 1;
      setStepMistakes(mistakes);
      if (mistakes >= 2) {
        if (inputPos >= route.length - 1) setPhase('roundDone');
        else {
          setInputPos((p) => p + 1);
          setStepMistakes(0);
        }
      }
    }
  };

  const cellSize = Math.min((width - spacing.lg * 2 - spacing.md * 2) / 3, 104);
  const showDecoy =
    phase === 'preview' && decoyStep !== null && previewStep === decoyStep.afterStep;

  const banner =
    phase === 'recall'
      ? 'Tap the route in order'
      : phase === 'rotate'
        ? 'The map is rotating…'
        : 'Watch the route';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg }}>
      <RuleBanner
        text={banner}
        icon={phase === 'recall' ? 'hand-left-outline' : phase === 'rotate' ? 'sync-outline' : 'eye-outline'}
        changeToken={phase === 'recall' ? 1 : 0}
      />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
          width: cellSize * 3 + spacing.md * 2,
          justifyContent: 'center',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((visualIndex) => {
          const cell = displayCell(visualIndex);
          const landmark = layout[cell];
          const routeStep = route.indexOf(cell);
          const isLit = phase === 'preview' && routeStep >= 0 && routeStep <= previewStep;
          const isCurrent = phase === 'preview' && routeStep === previewStep;
          const isDecoy = showDecoy && decoyStep?.cell === cell;
          const wasTapped = tapped?.cell === cell;
          const collected = phase === 'recall' && routeStep >= 0 && routeStep < inputPos;

          return (
            <Pressable
              key={visualIndex}
              disabled={phase !== 'recall'}
              accessibilityLabel={landmark.name}
              onPress={() => handleTap(cell)}
              style={({ pressed }) => ({
                width: cellSize,
                height: cellSize,
                borderRadius: radius.tile,
                backgroundColor: isLit
                  ? LIT_COLOR
                  : isDecoy
                    ? 'rgba(11,31,53,0.25)'
                    : collected
                      ? `${colors.success}33`
                      : pressed
                        ? 'rgba(255,255,255,1)'
                        : 'rgba(255,255,255,0.9)',
                borderWidth: 2,
                borderColor:
                  wasTapped && phase === 'recall'
                    ? tapped.kind === 'correct'
                      ? colors.success
                      : colors.error
                    : isCurrent
                      ? '#FFFFFF'
                      : `${landmark.color}44`,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              })}
            >
              {isLit && (
                <View
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="caption" weight="extraBold" color={LIT_COLOR}>
                    {routeStep + 1}
                  </AppText>
                </View>
              )}
              {collected && (
                <View style={{ position: 'absolute', top: 6, right: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              )}
              <Ionicons
                name={landmark.icon}
                size={cellSize * 0.32}
                color={isLit ? '#FFFFFF' : landmark.color}
              />
              <AppText variant="caption" weight="bold" color={isLit ? '#FFFFFF' : colors.textSoft}>
                {landmark.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ minHeight: 44, alignItems: 'center' }}>
        {phase === 'recall' && (
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {route.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: i < inputPos ? colors.success : colors.trackFaint,
                }}
              />
            ))}
          </View>
        )}
        {phase === 'roundDone' && (
          <AppText variant="gameLabel" color={colors.success} center>
            Route complete.
          </AppText>
        )}
      </View>
    </View>
  );
}
