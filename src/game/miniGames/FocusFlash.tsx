import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { gameConfig } from '@/constants/gameConfig';
import { radius, spacing, tapTarget } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { pick, rngFromString, sample, shuffle } from '@/utils/random';
import {
  ENCOURAGEMENTS_CORRECT,
  ENCOURAGEMENTS_MISS,
  usePausableTimeout,
  usePhase,
  useReactionClock,
  useRoundTracker,
  type MiniGameProps,
} from './shared';

type GameObject = { name: string; icon: keyof typeof Ionicons.glyphMap; color: string };

// Abstract cues in tints bright enough for the dark focus surface.
const OBJECTS: GameObject[] = [
  { name: 'Bolt', icon: 'flash', color: '#9AF23D' },
  { name: 'Cube', icon: 'cube', color: '#5EA8DC' },
  { name: 'Key', icon: 'key', color: '#F5B942' },
  { name: 'Disc', icon: 'disc', color: '#C5CEDD' },
  { name: 'Grid', icon: 'grid', color: '#7FB069' },
  { name: 'Star', icon: 'star', color: '#E8A87C' },
  { name: 'Triangle', icon: 'triangle', color: '#5EA8DC' },
  { name: 'Square', icon: 'square', color: '#C5CEDD' },
];

const COLOR_CHOICES = [
  { name: 'Blue', color: '#5EA8DC' },
  { name: 'Lime', color: '#9AF23D' },
  { name: 'Amber', color: '#F5B942' },
  { name: 'Slate', color: '#C5CEDD' },
  { name: 'Green', color: '#7FB069' },
  { name: 'Coral', color: '#F0876C' },
];

type Round = {
  center: GameObject;
  centerColor: { name: string; color: string };
  sparklePos: number;
  distractorPositions: number[];
  objectChoices: GameObject[];
  colorChoices: { name: string; color: string }[];
  positionChoices: number[];
  questions: ('center' | 'location' | 'color')[];
};

function buildRound(seed: string, roundIndex: number, difficulty: MiniGameProps['difficulty']): Round {
  const rng = rngFromString(`${seed}-ff-${roundIndex}`);
  const center = pick(rng, OBJECTS);
  const centerColor = pick(rng, COLOR_CHOICES);
  const sparklePos = Math.floor(rng() * 8);
  const otherPositions = [0, 1, 2, 3, 4, 5, 6, 7].filter((p) => p !== sparklePos);
  const distractorPositions = sample(rng, otherPositions, difficulty.distractors);

  const objectChoices = shuffle(rng, [
    center,
    ...sample(rng, OBJECTS.filter((o) => o.name !== center.name), Math.max(1, difficulty.choices - 1)),
  ]);
  const colorChoices = shuffle(rng, [
    centerColor,
    ...sample(rng, COLOR_CHOICES.filter((c) => c.name !== centerColor.name), Math.max(1, difficulty.choices - 1)),
  ]);
  const positionChoices = shuffle(rng, [
    sparklePos,
    ...sample(rng, otherPositions.filter((p) => !distractorPositions.includes(p)), Math.min(difficulty.choices, 5)),
  ]);

  const rule = difficulty.focusRule ?? 'location';
  // 'dual' asks two questions per round; at level 12+ the pair itself varies
  // round to round, so the player can't settle into one recall strategy.
  const questions: Round['questions'] =
    rule === 'location'
      ? ['location']
      : rule === 'colorMatch'
        ? ['color']
        : difficulty.level >= 12
          ? (sample(rng, ['center', 'location', 'color'] as Round['questions'], 2) as Round['questions'])
          : ['center', 'location'];

  return { center, centerColor, sparklePos, distractorPositions, objectChoices, colorChoices, positionChoices, questions };
}

/** Slowly sweeping lighthouse beam behind the radar. */
function Beam({ size }: { size: number }) {
  const { reducedMotion } = useTheme();
  const rotation = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    rotation.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
  }, [reducedMotion, rotation]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, alignItems: 'center' }, style]}>
      <View
        style={{
          width: 3,
          height: size / 2,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 2,
        }}
      />
    </Animated.View>
  );
}

export function FocusFlash({ difficulty, paused, seed, onComplete, onRoundChange, roundCount }: MiniGameProps) {
  const { width, height } = useWindowDimensions();
  const { fs, reducedMotion } = useTheme();
  const totalRounds = roundCount ?? gameConfig.roundsPerSession.focus_flash;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const [roundIndex, setRoundIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'ready' | 'flash' | 'question' | 'feedback'>('ready');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const round = useMemo(() => buildRound(seed, roundIndex, difficulty), [seed, roundIndex, difficulty]);
  const question = round.questions[questionIndex];

  useEffect(() => {
    onRoundChange?.(roundIndex + 1);
  }, [roundIndex, onRoundChange]);

  // Phase timers.
  usePausableTimeout(() => setPhase('flash'), phase === 'ready' ? 700 : null, paused, token);
  usePausableTimeout(
    () => {
      setPhase('question');
      clock.start();
    },
    phase === 'flash' ? difficulty.previewMs : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (questionIndex < round.questions.length - 1) {
        setQuestionIndex((q) => q + 1);
        setPhase('question');
        clock.start();
      } else if (roundIndex < totalRounds - 1) {
        setQuestionIndex(0);
        setRoundIndex((r) => r + 1);
        setPhase('ready');
      } else {
        onComplete(tracker.summary(totalRounds, true));
      }
    },
    phase === 'feedback' ? 850 : null,
    paused,
    token
  );

  const answer = (correct: boolean) => {
    if (phase !== 'question') return;
    tracker.record(correct, clock.elapsed());
    setLastAnswerCorrect(correct);
    const rng = rngFromString(`${seed}-fb-${roundIndex}-${questionIndex}-${correct}`);
    setFeedbackText(correct ? pick(rng, ENCOURAGEMENTS_CORRECT) : pick(rng, ENCOURAGEMENTS_MISS));
    if (correct) {
      playSound('correct');
      successHaptic();
    } else {
      playSound('wrong');
      warningHaptic();
    }
    setPhase('feedback');
  };

  const radarSize = Math.min(width - spacing.xl * 2, height * 0.42, 360);
  const dotRadius = radarSize / 2 - 30;
  const positionXY = (pos: number) => {
    const angle = (pos * 45 - 90) * (Math.PI / 180);
    return { x: Math.cos(angle) * dotRadius, y: Math.sin(angle) * dotRadius };
  };

  const showSparkle = phase === 'flash';
  const answeringLocation = phase === 'question' && question === 'location';

  const prompt =
    phase === 'ready'
      ? 'Get ready…'
      : phase === 'flash'
        ? 'Keep your eyes on the center'
        : question === 'center'
          ? 'What appeared in the center?'
          : question === 'location'
            ? 'Where did the signal appear?'
            : 'What color was the center cue?';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg }}>
      {/* Radar */}
      <View style={{ width: radarSize, height: radarSize, alignItems: 'center', justifyContent: 'center' }}>
        {[1, 0.72, 0.44].map((scale) => (
          <View
            key={scale}
            style={{
              position: 'absolute',
              width: radarSize * scale,
              height: radarSize * scale,
              borderRadius: (radarSize * scale) / 2,
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          />
        ))}
        <Beam size={radarSize} />

        {/* Center card */}
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: radius.tile,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.28)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {phase === 'flash' ? (
            <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(120)}>
              <Ionicons
                name={round.center.icon}
                size={52}
                color={round.questions.includes('color') ? round.centerColor.color : round.center.color}
              />
            </Animated.View>
          ) : phase === 'ready' ? (
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.7)' }} />
          ) : (
            <Ionicons name="help" size={40} color="rgba(255,255,255,0.5)" />
          )}
        </View>

        {/* Peripheral positions */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((pos) => {
          const { x, y } = positionXY(pos);
          const isSparkle = pos === round.sparklePos;
          const isDistractor = round.distractorPositions.includes(pos);
          const isChoice = answeringLocation && round.positionChoices.includes(pos);
          return (
            <Pressable
              key={pos}
              disabled={!isChoice}
              accessibilityLabel={isChoice ? `Position ${pos + 1}` : undefined}
              onPress={() => answer(pos === round.sparklePos)}
              style={{
                position: 'absolute',
                transform: [{ translateX: x }, { translateY: y }],
                width: answeringLocation ? tapTarget.min : 26,
                height: answeringLocation ? tapTarget.min : 26,
                borderRadius: tapTarget.min / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isChoice ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderWidth: isChoice ? 2 : 0,
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            >
              {showSparkle && isSparkle && (
                <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(100)}>
                  <Ionicons name="ellipse" size={20} color="#9AF23D" />
                </Animated.View>
              )}
              {showSparkle && isDistractor && (
                <Ionicons name="ellipse" size={16} color="rgba(255,255,255,0.35)" />
              )}
              {!showSparkle && !isChoice && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' }} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Prompt + answers */}
      <View style={{ width: '100%', minHeight: height * 0.26, alignItems: 'center', gap: spacing.lg }}>
        <AppText variant="gameLabel" color="#FFFFFF" center>
          {phase === 'feedback' ? feedbackText : prompt}
        </AppText>

        {phase === 'feedback' && (
          <Ionicons
            name={lastAnswerCorrect ? 'checkmark-circle' : 'close-circle'}
            size={44}
            color={lastAnswerCorrect ? '#7FB069' : '#F5B942'}
          />
        )}

        {phase === 'question' && question === 'center' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
            {round.objectChoices.map((obj) => (
              <Pressable
                key={obj.name}
                accessibilityLabel={obj.name}
                onPress={() => answer(obj.name === round.center.name)}
                style={({ pressed }) => ({
                  width: 76,
                  height: 84,
                  borderRadius: radius.tile,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.14)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,255,255,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                })}
              >
                <Ionicons name={obj.icon} size={34} color={obj.color} />
                <AppText variant="caption" color="rgba(255,255,255,0.85)">
                  {obj.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}

        {phase === 'question' && question === 'color' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
            {round.colorChoices.map((c) => (
              <Pressable
                key={c.name}
                accessibilityLabel={c.name}
                onPress={() => answer(c.name === round.centerColor.name)}
                style={({ pressed }) => ({
                  width: 76,
                  height: 84,
                  borderRadius: radius.tile,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.14)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,255,255,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                })}
              >
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.color }} />
                <AppText variant="caption" color="rgba(255,255,255,0.85)">
                  {c.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}

        {answeringLocation && (
          <AppText variant="body" color="rgba(255,255,255,0.7)" center>
            Tap the highlighted position
          </AppText>
        )}
      </View>
    </View>
  );
}
