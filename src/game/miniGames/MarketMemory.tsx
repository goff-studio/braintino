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
import { usePausableTimeout, usePhase, useReactionClock, useRoundTracker, type MiniGameProps } from './shared';

type Category = 'essentials' | 'food' | 'work';

// Everyday items in a single muted accent — practical, not decorative.
const ACCENT = '#4B6478';
const ITEMS: { name: string; icon: keyof typeof Ionicons.glyphMap; color: string; cat: Category }[] = [
  { name: 'Keys', icon: 'key', color: ACCENT, cat: 'essentials' },
  { name: 'Wallet', icon: 'wallet', color: ACCENT, cat: 'essentials' },
  { name: 'Phone', icon: 'phone-portrait', color: ACCENT, cat: 'essentials' },
  { name: 'Glasses', icon: 'glasses', color: ACCENT, cat: 'essentials' },
  { name: 'Coffee', icon: 'cafe', color: ACCENT, cat: 'food' },
  { name: 'Water', icon: 'water', color: ACCENT, cat: 'food' },
  { name: 'Snack', icon: 'fast-food', color: ACCENT, cat: 'food' },
  { name: 'Apple', icon: 'nutrition', color: ACCENT, cat: 'food' },
  { name: 'Notebook', icon: 'book', color: ACCENT, cat: 'work' },
  { name: 'Charger', icon: 'battery-charging', color: ACCENT, cat: 'work' },
  { name: 'Card', icon: 'card', color: ACCENT, cat: 'work' },
  { name: 'Headphones', icon: 'headset', color: ACCENT, cat: 'work' },
];

const CATEGORY_LABEL: Record<Category, string> = {
  essentials: 'everyday essentials',
  food: 'food & drink',
  work: 'work items',
};

type RoundData = {
  grid: typeof ITEMS;
  targets: string[];
  instruction: string;
  listItems?: typeof ITEMS;
};

function buildRound(seed: string, roundIndex: number, difficulty: MiniGameProps['difficulty']): RoundData {
  const rng = rngFromString(`${seed}-mm-${roundIndex}`);
  const mode = difficulty.listMode ?? 'items';
  const gridSize = Math.min(difficulty.choices, 12);
  const listLength = difficulty.sequenceLength ?? 2;

  if (mode === 'category') {
    const cat = (['essentials', 'food', 'work'] as Category[])[Math.floor(rng() * 3)];
    const inCat = sample(rng, ITEMS.filter((i) => i.cat === cat), 3);
    const others = sample(rng, ITEMS.filter((i) => i.cat !== cat), gridSize - inCat.length);
    return {
      grid: shuffle(rng, [...inCat, ...others]),
      targets: inCat.map((i) => i.name),
      instruction: `Find all the ${CATEGORY_LABEL[cat]}`,
    };
  }

  if (mode === 'exclusion') {
    const grid = sample(rng, ITEMS, Math.min(gridSize, 6));
    const excluded = grid[Math.floor(rng() * grid.length)];
    return {
      grid: shuffle(rng, grid),
      targets: grid.filter((i) => i.name !== excluded.name).map((i) => i.name),
      instruction: `Tap everything EXCEPT the ${excluded.name.toLowerCase()}`,
    };
  }

  const listItems = sample(rng, ITEMS, listLength);
  const fillers = sample(rng, ITEMS.filter((i) => !listItems.includes(i)), gridSize - listLength);
  return {
    grid: shuffle(rng, [...listItems, ...fillers]),
    targets: listItems.map((i) => i.name),
    instruction: 'Memorize this list',
    listItems,
  };
}

export function MarketMemory({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.market_memory;
  const tracker = useRoundTracker();
  const clock = useReactionClock(paused);

  const [roundIndex, setRoundIndex] = useState(0);
  const { phase, setPhase, token } = usePhase<'list' | 'find' | 'roundDone'>('list');
  const [collected, setCollected] = useState<string[]>([]);
  const [wrongItem, setWrongItem] = useState<string | null>(null);

  const round = useMemo(() => buildRound(seed, roundIndex, difficulty), [seed, roundIndex, difficulty]);
  const showListDuringFind = (difficulty.listMode ?? 'items') !== 'items';

  useEffect(() => {
    onRoundChange?.(roundIndex + 1);
  }, [roundIndex, onRoundChange]);

  usePausableTimeout(
    () => {
      setCollected([]);
      setWrongItem(null);
      clock.start();
      setPhase('find');
    },
    phase === 'list' ? difficulty.previewMs : null,
    paused,
    token
  );
  usePausableTimeout(
    () => {
      if (roundIndex < totalRounds - 1) {
        setRoundIndex((r) => r + 1);
        setPhase('list');
      } else {
        onComplete(tracker.summary(totalRounds, true));
      }
    },
    phase === 'roundDone' ? 1000 : null,
    paused,
    token
  );

  const handleTap = (name: string) => {
    if (phase !== 'find' || collected.includes(name)) return;
    const correct = round.targets.includes(name);
    tracker.record(correct, clock.elapsed());
    clock.start();
    if (correct) {
      playSound('correct');
      successHaptic();
      const next = [...collected, name];
      setCollected(next);
      if (round.targets.every((t) => next.includes(t))) setPhase('roundDone');
    } else {
      playSound('wrong');
      warningHaptic();
      setWrongItem(name);
    }
  };

  const columns = 3;
  const tileSize = Math.min((width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns, 104);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: spacing.lg }}>
      {phase === 'list' ? (
        <View style={{ alignItems: 'center', gap: spacing.lg, width: '100%' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.card,
              padding: spacing.xl,
              alignItems: 'center',
              gap: spacing.md,
              width: '100%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <AppText variant="gameLabel" center>
              {round.instruction}
            </AppText>
            {round.listItems && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
                {round.listItems.map((item) => (
                  <View key={item.name} style={{ alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: radius.tile,
                        backgroundColor: `${item.color}1E`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={item.icon} size={30} color={item.color} />
                    </View>
                    <AppText variant="caption" weight="bold">
                      {item.name}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <AppText variant="gameLabel" center>
              {showListDuringFind ? round.instruction : 'Tap only the items from the list'}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.success} />
              <AppText variant="body" weight="bold" color={colors.textSoft}>
                {collected.length}/{round.targets.length} found
              </AppText>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: spacing.md,
              maxWidth: columns * (tileSize + spacing.md),
            }}
          >
            {round.grid.map((item) => {
              const isCollected = collected.includes(item.name);
              const isWrong = wrongItem === item.name;
              return (
                <Pressable
                  key={item.name}
                  accessibilityLabel={item.name}
                  disabled={phase !== 'find' || isCollected}
                  onPress={() => handleTap(item.name)}
                  style={({ pressed }) => ({
                    width: tileSize,
                    height: tileSize,
                    borderRadius: radius.tile,
                    backgroundColor: isCollected
                      ? `${colors.success}22`
                      : pressed
                        ? colors.cardSoft
                        : colors.card,
                    borderWidth: 2,
                    borderColor: isCollected ? colors.success : isWrong ? colors.error : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    opacity: isCollected ? 0.75 : 1,
                  })}
                >
                  {isCollected && (
                    <View style={{ position: 'absolute', top: 6, right: 8 }}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                  )}
                  <Ionicons name={item.icon} size={tileSize * 0.36} color={item.color} />
                  <AppText variant="caption" weight="bold" color={colors.textSoft}>
                    {item.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={{ minHeight: 36, alignItems: 'center' }}>
            {phase === 'roundDone' && (
              <AppText variant="gameLabel" color={colors.success} center>
                All items found.
              </AppText>
            )}
          </View>
        </>
      )}
    </View>
  );
}
