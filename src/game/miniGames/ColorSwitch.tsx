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
  { name: 'BLUE', color: '#0067B1' },
  { name: 'GREEN', color: '#3E7C17' },
  { name: 'AMBER', color: '#B26A00' },
  { name: 'CORAL', color: '#E85D4A' },
];

type Rule = 'color' | 'word';

export function ColorSwitch({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.color_switch;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const choiceSet = INK_COLORS.slice(0, Math.max(2, difficulty.choices));
  const switchEvery = difficulty.ruleSwitchFrequency ?? 0;
  const conflictRate = difficulty.conflictRate ?? 0;

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
    // Always draw the conflict roll so the sequence stays seed-deterministic.
    const conflictRoll = rng();
    let ink = word;
    if (conflictRoll < conflictRate) {
      const others = choiceSet.filter((c) => c.name !== word.name);
      ink = others[Math.floor(rng() * others.length)];
    }
    return { word, ink };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, roundIndex, conflictRate, difficulty.choices]);

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
        text={rule === 'color' ? 'Respond to the COLOR you see' : 'Respond to the WORD you read'}
        icon={rule === 'color' ? 'color-fill-outline' : 'text-outline'}
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
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        {phase === 'feedback' ? (
          <Ionicons
            name={lastCorrect ? 'checkmark-circle' : 'close-circle'}
            size={56}
            color={lastCorrect ? colors.success : colors.error}
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
              backgroundColor: pressed ? colors.cardSoft : colors.card,
              borderWidth: 2,
              borderColor: c.color,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            })}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.color }} />
            <AppText variant="body" weight="bold" color={colors.text}>
              {c.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
