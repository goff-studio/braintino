import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import { getStartingLevel } from '@/game/engines/difficulty';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const settings = useGameStore((s) => s.settings);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  return (
    <ScreenBackground gradient={gradients.progress}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
      >
        <Reveal index={0}>
          <AppText variant="heading">Practice</AppText>
        </Reveal>
        <Reveal index={1}>
          <AppText variant="body" color={colors.textSoft} style={{ marginBottom: spacing.sm }}>
            Choose an exercise and practice at your own pace. Difficulty adapts to your accuracy.
          </AppText>
        </Reveal>

        {MINI_GAME_IDS.map((id, i) => {
          const game = MINI_GAMES[id];
          const mg = progress.miniGameProgress[id];
          const locked = game.unlockLevel > progress.globalLevel;
          return (
            <Reveal key={id} index={i + 2}>
              <ExerciseCard
                config={game}
                level={mg?.level ?? getStartingLevel(progress, settings.difficultyMode)}
                bestAccuracy={mg?.bestAccuracy}
                locked={locked}
                onPress={() => {
                  startPracticeSession(id);
                  router.push(`/play/${id}`);
                }}
              />
            </Reveal>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}
