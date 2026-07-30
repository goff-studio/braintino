import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { gameConfig } from '@/constants/gameConfig';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { rngFromString, sample } from '@/utils/random';
import { RuleBanner } from './RuleBanner';
import {
  usePausableTimeout,
  usePhase,
  useReactionClock,
  useRoundTracker,
  type MiniGameProps,
} from './shared';

// Abstract geometric tiles in a single accent — position and symbol carry the
// sequence, not color.
const TILES: { icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { icon: 'square', color: '#3E7C17' },
  { icon: 'triangle', color: '#3E7C17' },
  { icon: 'ellipse', color: '#3E7C17' },
  { icon: 'star', color: '#3E7C17' },
  { icon: 'cube', color: '#3E7C17' },
  { icon: 'prism', color: '#3E7C17' },
  { icon: 'disc', color: '#3E7C17' },
  { icon: 'flash', color: '#3E7C17' },
  { icon: 'grid', color: '#3E7C17' },
];

function GardenTile({
  tile,
  size,
  lit,
  onPress,
  disabled,
  flash,
}: {
  tile: (typeof TILES)[number];
  size: number;
  lit: boolean;
  onPress: () => void;
  disabled: boolean;
  flash: 'correct' | 'wrong' | null;
}) {
  const { reducedMotion } = useTheme();
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    if (flash === 'correct') {
      scale.value = withSequence(withTiming(1.12, { duration: 110 }), withSpring(1, { damping: 12 }));
    } else if (flash === 'wrong') {
      shake.value = withSequence(
        withTiming(-5, { duration: 55 }),
        withTiming(5, { duration: 55 }),
        withTiming(-3, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
    }
  }, [flash, reducedMotion, scale, shake]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const background = lit
    ? tile.color
    : flash === 'correct'
      ? `${tile.color}66`
      : '#FFFFFF';

  return (
    <Animated.View style={style}>
      <Pressable
        disabled={disabled}
        accessibilityLabel={`Sequence tile ${tile.icon}`}
        onPress={onPress}
        style={{
          width: size,
          height: size,
          borderRadius: radius.tile,
          backgroundColor: background,
          borderWidth: 2,
          borderColor: lit ? '#FFFFFF' : `${tile.color}55`,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: tile.color,
          shadowOpacity: lit ? 0.6 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: lit ? 6 : 0,
        }}
      >
        <Ionicons name={tile.icon} size={size * 0.42} color={lit ? '#FFFFFF' : tile.color} />
      </Pressable>
    </Animated.View>
  );
}

export function PatternGarden({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.pattern_garden;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const tileCount = difficulty.choices;
  const columns = 3;
  const sequenceLength = difficulty.sequenceLength ?? 3;
  const reverse = difficulty.reverse ?? false;

  const [roundIndex, setRoundIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'intro' | 'watch' | 'repeat' | 'roundDone'>('intro');
  const [litIndex, setLitIndex] = useState(-1); // index within sequence during watch
  const [inputPos, setInputPos] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const [flashTile, setFlashTile] = useState<{ index: number; kind: 'correct' | 'wrong' } | null>(null);

  const tiles = useMemo(
    () => sample(rngFromString(`${seed}-pg-tiles`), TILES, tileCount),
    [seed, tileCount]
  );
  const sequence = useMemo(
    () => {
      const rng = rngFromString(`${seed}-pg-${roundIndex}`);
      // Sequence of tile indices; consecutive repeats avoided for clarity.
      const seq: number[] = [];
      while (seq.length < sequenceLength) {
        const next = Math.floor(rng() * tileCount);
        if (seq[seq.length - 1] !== next) seq.push(next);
      }
      return seq;
    },
    [seed, roundIndex, sequenceLength, tileCount]
  );
  const expected = useMemo(() => (reverse ? [...sequence].reverse() : sequence), [sequence, reverse]);

  useEffect(() => {
    onRoundChange?.(roundIndex + 1);
  }, [roundIndex, onRoundChange]);

  // Intro pause, then play the sequence step by step.
  usePausableTimeout(
    () => {
      setLitIndex(0);
      setPhase('watch');
    },
    phase === 'intro' ? 900 : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (litIndex < sequence.length - 1) {
        setLitIndex((i) => i + 1);
        setPhase('watch'); // bump token to re-arm the timer
      } else {
        setLitIndex(-1);
        setInputPos(0);
        setRoundMistakes(0);
        clock.start();
        setPhase('repeat');
      }
    },
    phase === 'watch' ? difficulty.previewMs : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (roundIndex < totalRounds - 1) {
        setRoundIndex((r) => r + 1);
        setFlashTile(null);
        setPhase('intro');
      } else {
        onComplete(tracker.summary(totalRounds, true));
      }
    },
    phase === 'roundDone' ? 900 : null,
    paused,
    token
  );

  const handleTap = (tileIndex: number) => {
    if (phase !== 'repeat') return;
    const correct = tileIndex === expected[inputPos];
    tracker.record(correct, clock.elapsed());
    clock.start();
    setFlashTile({ index: tileIndex, kind: correct ? 'correct' : 'wrong' });
    if (correct) {
      playSound('correct');
      successHaptic();
      if (inputPos >= expected.length - 1) {
        setPhase('roundDone');
      } else {
        setInputPos((p) => p + 1);
      }
    } else {
      playSound('wrong');
      warningHaptic();
      const mistakes = roundMistakes + 1;
      setRoundMistakes(mistakes);
      // After two slips on the same step, move on gently.
      if (mistakes >= 2) {
        if (inputPos >= expected.length - 1) setPhase('roundDone');
        else {
          setInputPos((p) => p + 1);
          setRoundMistakes(0);
        }
      }
    }
  };

  const tileSize = Math.min((width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns, 104);
  const litTile = phase === 'watch' && litIndex >= 0 ? sequence[litIndex] : -1;

  const banner =
    phase === 'watch' || phase === 'intro'
      ? reverse
        ? 'Watch closely…'
        : 'Watch the sequence'
      : reverse
        ? 'Repeat it in REVERSE'
        : 'Your turn — repeat it';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg }}>
      <RuleBanner
        text={banner}
        icon={phase === 'repeat' ? (reverse ? 'swap-horizontal' : 'hand-left-outline') : 'eye-outline'}
        changeToken={phase === 'repeat' ? 1 : 0}
      />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: spacing.md,
          maxWidth: columns * (tileSize + spacing.md),
        }}
      >
        {tiles.map((tile, i) => (
          <GardenTile
            key={`${tile.icon}-${i}`}
            tile={tile}
            size={tileSize}
            lit={litTile === i}
            disabled={phase !== 'repeat'}
            onPress={() => handleTap(i)}
            flash={flashTile?.index === i ? flashTile.kind : null}
          />
        ))}
      </View>

      <View style={{ minHeight: 56, alignItems: 'center', gap: spacing.xs }}>
        {phase === 'repeat' && (
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {expected.map((_, i) => (
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
            Sequence complete.
          </AppText>
        )}
      </View>
    </View>
  );
}
