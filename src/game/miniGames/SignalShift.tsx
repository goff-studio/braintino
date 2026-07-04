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

const SHAPES = [
  { name: 'Circle', icon: 'ellipse' as const },
  { name: 'Square', icon: 'square' as const },
  { name: 'Triangle', icon: 'triangle' as const },
];
const CARD_COLORS = [
  { name: 'Blue', color: '#2F80ED' },
  { name: 'Coral', color: '#FF7A59' },
  { name: 'Mint', color: '#1FA98F' },
];

type Rule = 'shape' | 'color';

export function SignalShift({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.signal_shift;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const zoneCount = Math.max(2, Math.min(3, difficulty.choices));
  const shapes = SHAPES.slice(0, zoneCount);
  const cardColors = CARD_COLORS.slice(0, zoneCount);
  const switchEvery = difficulty.ruleSwitchFrequency ?? 8;

  const [roundIndex, setRoundIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'show' | 'feedback'>('show');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [ruleChangeToken, setRuleChangeToken] = useState(0);

  const rule: Rule = Math.floor(roundIndex / switchEvery) % 2 === 0 ? 'shape' : 'color';
  const prevRule: Rule =
    roundIndex > 0 ? (Math.floor((roundIndex - 1) / switchEvery) % 2 === 0 ? 'shape' : 'color') : rule;

  const round = useMemo(() => {
    const rng = rngFromString(`${seed}-ss-${roundIndex}`);
    const shape = shapes[Math.floor(rng() * shapes.length)];
    const color = cardColors[Math.floor(rng() * cardColors.length)];
    const hasDistractor = difficulty.distractors > 0 && rng() < 0.4;
    return { shape, color, hasDistractor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, roundIndex, zoneCount, difficulty.distractors]);

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
    phase === 'feedback' ? 600 : null,
    paused,
    token
  );

  const sort = (zoneName: string) => {
    if (phase !== 'show') return;
    const target = rule === 'shape' ? round.shape.name : round.color.name;
    const correct = zoneName === target;
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
        text={rule === 'shape' ? 'Sort by SHAPE' : 'Sort by COLOR'}
        icon={rule === 'shape' ? 'shapes' : 'color-fill'}
        color={rule === 'shape' ? '#8E7CFF' : '#FF7A59'}
        changeToken={ruleChangeToken}
      />

      {/* Signal card */}
      <View
        style={{
          width: 170,
          height: 170,
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
          <>
            <Ionicons name={round.shape.icon} size={84} color={round.color.color} />
            {round.hasDistractor && (
              <View style={{ position: 'absolute', top: 10, right: 12 }}>
                <Ionicons name="star" size={20} color="rgba(16,42,67,0.3)" />
              </View>
            )}
          </>
        )}
      </View>

      {/* Sorting docks */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md, width: '100%' }}>
        {(rule === 'shape' ? shapes : cardColors).map((zone) => (
          <Pressable
            key={zone.name}
            accessibilityLabel={`${zone.name} dock`}
            disabled={phase !== 'show'}
            onPress={() => sort(zone.name)}
            style={({ pressed }) => ({
              flex: 1,
              maxWidth: 120,
              minHeight: tapTarget.game + 24,
              borderRadius: radius.tile,
              backgroundColor: pressed ? colors.cardSoft : colors.card,
              borderWidth: 2,
              borderColor: 'color' in zone ? zone.color : colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: spacing.md,
            })}
          >
            {'icon' in zone ? (
              <Ionicons name={zone.icon} size={36} color={colors.secondary} />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: zone.color }} />
            )}
            <AppText variant="caption" weight="bold" color={colors.textSoft}>
              {zone.name}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
