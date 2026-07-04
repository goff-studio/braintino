import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { LevelBadge } from '@/components/LevelBadge';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SkillChip } from '@/components/SkillChip';
import { StarRating } from '@/components/StarRating';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
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
        <AppText variant="heading">Practice</AppText>
        <AppText variant="body" color={colors.textSoft}>
          Pick any puzzle and play at your own pace.
        </AppText>

        {MINI_GAME_IDS.map((id) => {
          const game = MINI_GAMES[id];
          const mg = progress.miniGameProgress[id];
          const locked = game.unlockLevel > progress.globalLevel;
          return (
            <AppCard
              key={id}
              accessibilityLabel={locked ? `${game.title}, unlocks at level ${game.unlockLevel}` : `Play ${game.title}`}
              onPress={
                locked
                  ? undefined
                  : () => {
                      startPracticeSession(id);
                      router.push(`/play/${id}`);
                    }
              }
              style={{ opacity: locked ? 0.55 : 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 20,
                    backgroundColor: `${game.color}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={locked ? 'lock-closed' : (game.icon as keyof typeof Ionicons.glyphMap)}
                    size={28}
                    color={locked ? colors.textSoft : game.color}
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="bodyLarge" weight="extraBold">
                    {game.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft}>
                    {game.description}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                    <SkillChip skill={game.skill} labelOverride={game.skillLabel} />
                    {!locked && <LevelBadge level={mg?.level ?? 1} color={game.color} compact />}
                    <AppText variant="caption" color={colors.textSoft}>
                      ~{Math.max(1, Math.round(game.baseDurationSec / 60))} min
                    </AppText>
                  </View>
                </View>
                <View style={{ alignItems: 'center', gap: 4 }}>
                  {locked ? (
                    <AppText variant="caption" color={colors.textSoft} center>
                      Level {game.unlockLevel}
                    </AppText>
                  ) : (
                    <>
                      <StarRating stars={mg?.bestStars ?? 0} size={14} />
                      <Ionicons name="play-circle" size={30} color={game.color} />
                    </>
                  )}
                </View>
              </View>
            </AppCard>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}
