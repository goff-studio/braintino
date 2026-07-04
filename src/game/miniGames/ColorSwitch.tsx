import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { gameConfig } from '@/constants/gameConfig';
import { radius, spacing, tapTarget } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { rngFromString } from '@/utils/random';
import { RuleBanner } from './RuleBanner';
import { usePausableTimeout, usePhase, useReactionClock, useRoundTracker, type MiniGameProps } from './shared';

const INK_COLORS = [
  { name: 'BLUE', color: '#2F80ED' },
  { name: 'CORAL', color: '#FF7A59' },
  { name: 'MINT', color: '#1FA98F' },
  { name: 'PURPLE', color: '#8E7CFF' },
];

type Rule = 'color' | 'word';

export function ColorSwitch({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.color_switch;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const choiceSet = INK_COLORS.slice(0, Math.max(2, difficulty.choices));
  const switchEvery = difficulty.ruleSwitchFrequency ?? 0;
  const conflictsOn = difficulty.level >= 10;

  const [roundIndex, setRoundIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'show' | 'feedback'>('show');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [ruleChangeToken, setRuleChangeToken] = useState(0);

  // Rule for this round; changes every `switchEvery` rounds when enabled.
  const rule: Rule = switchEvery > 0 && Math.floor(roundIndex / switchEvery) % 2 === 1 ? 'word' : 'color';
  const prevRule = switchEvery > 0 && roundIndex > 0
    ? (Math.floor((roundIndex - 1) / switchEvery) % 2 === 1 ? 'word' : 'color')
    : rule;

  const round = useMemo(() => {
    const rng = rngFromString(`${seed}-cs-${roundIndex}`);
    const word = choiceSet[Math.floor(rng() * choiceSet.length)];
    let ink = word;
    if (conflictsOn && rng() < 0.65) {
      const others = choiceSet.filter((c) => c.name !== word.name);
      ink = others[Math.floor(rng() * others.length)];
    }
    return { word, ink };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, roundIndex, conflictsOn, difficulty.choices]);

  useEffect(() => {
    onRoundChange?.(roundIndex + 1);
    clock.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  useEffect(() => {
    if (rule !== prevRule) {
      setRuleChangeToken((t) => t + 1);
      playSound('tap');
      warningHaptic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule]);

  usePausableTimeout(
    () => {
      if (roundIndex < totalRounds - 1) {
        setRoundIndex((r) => r + 1);
        setPhase('show');
      } else {
        onComplete(tracker.summary(totalRounds, true));
      }
    },
    phase === 'feedback' ? 620 : null,
    paused,
    token
  );

  const answer = (colorName: string) => {
    if (phase !== 'show') return;
    const target = rule === 'color' ? round.ink.name : round.word.name;
    const correct = colorName === target;
    tracker.record(correct, clock.elapsed());
    setLastCorrect(correct);
    if (correct) {
      playSound('correct');
      successHaptic();
    } else {
      playSound('wrong');
      warningHaptic();
    }
    setPhase('feedback');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg }}>
      <RuleBanner
        text={rule === 'color' ? 'Tap the COLOR you see' : 'Tap the WORD you read'}
        icon={rule === 'color' ? 'color-fill' : 'text'}
        color={rule === 'color' ? '#FF7A59' : '#2F80ED'}
        changeToken={ruleChangeToken}
      />

      {/* Central card */}
      <View
        style={{
          width: 220,
          height: 150,
          borderRadius: radius.card,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#102A43',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 5,
        }}
      >
        {phase === 'feedback' ? (
          <Ionicons
            name={lastCorrect ? 'checkmark-circle' : 'close-circle'}
            size={56}
            color={lastCorrect ? colors.success : colors.warning}
          />
        ) : (
          <AppText variant="display" weight="extraBold" color={round.ink.color}>
            {round.word.name}
          </AppText>
        )}
      </View>

      {/* Answer buttons */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
        {choiceSet.map((c) => (
          <Pressable
            key={c.name}
            accessibilityLabel={c.name}
            disabled={phase !== 'show'}
            onPress={() => answer(c.name)}
            style={({ pressed }) => ({
              minWidth: 96,
              minHeight: tapTarget.game + 12,
              borderRadius: radius.button,
              backgroundColor: pressed ? `${c.color}DD` : c.color,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            })}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' }} />
            <AppText variant="body" weight="extraBold" color="#FFFFFF">
              {c.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
