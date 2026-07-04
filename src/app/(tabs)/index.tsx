import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { TinoMascot } from '@/components/TinoMascot';
import { gradients } from '@/constants/colors';
import { ScreenBackground } from '@/components/ScreenBackground';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { rankForLevel } from '@/data/levels';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import { currentWeekKeys, todayKey } from '@/utils/date';

function StatCard({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <AppCard style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 2 }}>
      <Ionicons name={icon} size={22} color={color} />
      <AppText variant="gameLabel" weight="extraBold">
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textSoft}>
        {label}
      </AppText>
    </AppCard>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const startDailySession = useGameStore((s) => s.startDailySession);

  const today = todayKey();
  const plan = useMemo(() => getTodayDailyPlan(today, progress), [today, progress]);
  const dailyDone = progress.lastDailyCompletedDate === today;

  const weeklyMinutes = useMemo(() => {
    const week = currentWeekKeys();
    return Math.round(week.reduce((sum, key) => sum + (progress.minutesByDate[key] ?? 0), 0));
  }, [progress.minutesByDate]);

  return (
    <ScreenBackground gradient={gradients.home}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <AppText variant="heading">Braintino</AppText>
            <AppText variant="body" color={colors.textSoft}>
              {rankForLevel(progress.globalLevel)} · Level {progress.globalLevel}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="server" size={18} color="#FFB84D" />
            <AppText variant="bodyLarge" weight="extraBold">
              {progress.coins}
            </AppText>
          </View>
        </View>

        {/* Daily card */}
        <AppCard style={{ gap: spacing.md, paddingVertical: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TinoMascot size={92} mood={dailyDone ? 'cheer' : 'happy'} />
            <View style={{ flex: 1 }}>
              <AppText variant="title">Today’s Brain Boost</AppText>
              <AppText variant="body" color={colors.textSoft}>
                {plan.title} · 3 short puzzles · about 5 minutes
              </AppText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {plan.games.map((id) => {
              const game = MINI_GAMES[id];
              return (
                <View
                  key={id}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: `${game.color}14`,
                    borderRadius: 16,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <Ionicons name={game.icon as keyof typeof Ionicons.glyphMap} size={22} color={game.color} />
                  <AppText variant="caption" weight="bold" color={colors.textSoft}>
                    {game.shortTitle}
                  </AppText>
                </View>
              );
            })}
          </View>

          {dailyDone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <AppText variant="bodyLarge" weight="bold" color={colors.success}>
                You completed today’s boost!
              </AppText>
            </View>
          ) : (
            <AppButton
              title="Start Today"
              icon="play"
              onPress={() => {
                startDailySession();
                router.push('/daily');
              }}
            />
          )}
        </AppCard>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard icon="flame" value={String(progress.streak)} label="Streak" color="#FF7A59" />
          <StatCard icon="star" value={String(progress.totalStars)} label="Stars" color="#FFB84D" />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard icon="time" value={`${weeklyMinutes}m`} label="This week" color="#35D0BA" />
          <StatCard icon="trending-up" value={String(progress.globalLevel)} label="Level" color="#8E7CFF" />
        </View>

        {/* Practice shortcut */}
        <AppButton
          title="Practice a Puzzle"
          icon="game-controller"
          variant="ghost"
          onPress={() => router.push('/practice')}
        />
      </ScrollView>
    </ScreenBackground>
  );
}
