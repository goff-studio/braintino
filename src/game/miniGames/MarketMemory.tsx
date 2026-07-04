import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { TinoMascot } from '@/components/TinoMascot';
import { gameConfig } from '@/constants/gameConfig';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { rngFromString, sample, shuffle } from '@/utils/random';
import { usePausableTimeout, usePhase, useRoundTracker, type MiniGameProps } from './shared';

type Category = 'food' | 'nature' | 'objects';

const ITEMS: { name: string; icon: keyof typeof Ionicons.glyphMap; color: string; cat: Category }[] = [
  { name: 'Apple', icon: 'nutrition', color: '#FF6B6B', cat: 'food' },
  { name: 'Tea', icon: 'cafe', color: '#B3855A', cat: 'food' },
  { name: 'Fish', icon: 'fish', color: '#2F80ED', cat: 'food' },
  { name: 'Egg', icon: 'egg', color: '#FFB84D', cat: 'food' },
  { name: 'Flower', icon: 'flower', color: '#FF7A59', cat: 'nature' },
  { name: 'Leaf', icon: 'leaf', color: '#42C77B', cat: 'nature' },
  { name: 'Rose', icon: 'rose', color: '#F06292', cat: 'nature' },
  { name: 'Book', icon: 'book', color: '#8E7CFF', cat: 'objects' },
  { name: 'Key', icon: 'key', color: '#FFD166', cat: 'objects' },
  { name: 'Lantern', icon: 'bulb', color: '#FFB84D', cat: 'objects' },
  { name: 'Compass', icon: 'compass', color: '#35D0BA', cat: 'objects' },
  { name: 'Rope', icon: 'link', color: '#B3855A', cat: 'objects' },
];

const CATEGORY_LABEL: Record<Category, string> = {
  food: 'food & drinks',
  nature: 'plants & flowers',
  objects: 'everyday objects',
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
    const cat = (['food', 'nature', 'objects'] as Category[])[Math.floor(rng() * 3)];
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
    instruction: 'Remember Tino’s shopping list',
    listItems,
  };
}

export function MarketMemory({ difficulty, paused, seed, onComplete, onRoundChange }: MiniGameProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const totalRounds = gameConfig.roundsPerSession.market_memory;
  const tracker = useRoundTracker();

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
    tracker.record(correct);
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
          <TinoMascot size={96} mood="happy" />
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
            <AppText variant="caption" color={colors.textSoft}>
              Remember it — the market opens soon…
            </AppText>
          </View>
        </View>
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            <AppText variant="gameLabel" center>
              {showListDuringFind ? round.instruction : 'Tap only the items from the list'}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="basket" size={20} color={colors.warning} />
              <AppText variant="body" weight="bold" color={colors.textSoft}>
                {collected.length}/{round.targets.length} collected
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
                Basket packed!
              </AppText>
            )}
          </View>
        </>
      )}
    </View>
  );
}
