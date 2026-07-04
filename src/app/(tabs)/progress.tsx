import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { ProgressRing } from '@/components/ProgressRing';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SKILL_META } from '@/components/SkillChip';
import { TinoMascot } from '@/components/TinoMascot';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { COSMETICS } from '@/data/cosmetics';
import { rankForLevel, xpForLevel } from '@/data/levels';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { successHaptic, warningHaptic } from '@/services/haptics/haptics';
import { useGameStore } from '@/store/useGameStore';
import type { SkillType } from '@/types/game';
import { currentWeekKeys, todayKey } from '@/utils/date';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const unlockCosmetic = useGameStore((s) => s.unlockCosmetic);
  const selectCosmetic = useGameStore((s) => s.selectCosmetic);

  const weekKeys = currentWeekKeys();
  const today = todayKey();

  // Skill balance from recent results: average accuracy per trained skill.
  const skillBalance = useMemo(() => {
    const sums: Partial<Record<SkillType, { total: number; count: number }>> = {};
    for (const mg of Object.values(progress.miniGameProgress)) {
      for (const result of mg?.lastResults ?? []) {
        for (const skill of Object.keys(result.skillScores) as SkillType[]) {
          const entry = (sums[skill] ??= { total: 0, count: 0 });
          entry.total += result.accuracy;
          entry.count += 1;
        }
      }
    }
    return (Object.keys(SKILL_META) as SkillType[]).map((skill) => ({
      skill,
      value: sums[skill] ? sums[skill]!.total / sums[skill]!.count : 0,
      played: !!sums[skill],
    }));
  }, [progress.miniGameProgress]);

  const weeklyMinutes = Math.round(
    weekKeys.reduce((sum, key) => sum + (progress.minutesByDate[key] ?? 0), 0)
  );
  const xpNeeded = xpForLevel(progress.globalLevel);

  return (
    <ScreenBackground gradient={gradients.progress}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <AppText variant="heading">Progress Island</AppText>

        {/* Rank & level */}
        <AppCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <ProgressRing
            progress={progress.xp / xpNeeded}
            size={92}
            label={`${progress.globalLevel}`}
            color={colors.secondary}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="title">{rankForLevel(progress.globalLevel)}</AppText>
            <AppText variant="caption" color={colors.textSoft}>
              {progress.xp}/{xpNeeded} XP to level {progress.globalLevel + 1}
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: 4 }}>
              <AppText variant="caption" color={colors.textSoft}>
                🔥 {progress.streak}-day streak
              </AppText>
              <AppText variant="caption" color={colors.textSoft}>
                ⭐ {progress.totalStars}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Weekly training habit */}
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="extraBold">
            Training Habit
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekKeys.map((key, i) => {
              const played = (progress.minutesByDate[key] ?? 0) > 0 || progress.dailyHistory.includes(key);
              const isToday = key === today;
              return (
                <View key={key} style={{ alignItems: 'center', gap: 4 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: played ? colors.accent : 'rgba(16,42,67,0.07)',
                      borderWidth: isToday ? 2 : 0,
                      borderColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {played && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                  </View>
                  <AppText variant="caption" color={colors.textSoft}>
                    {WEEKDAY_LABELS[i]}
                  </AppText>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <AppText variant="caption" color={colors.textSoft}>
              {weeklyMinutes} min this week
            </AppText>
            <AppText variant="caption" color={colors.textSoft}>
              {progress.totalSessions} sessions total
            </AppText>
          </View>
        </AppCard>

        {/* Skill balance */}
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="extraBold">
            Skill Balance
          </AppText>
          {skillBalance.map(({ skill, value, played }) => {
            const meta = SKILL_META[skill];
            return (
              <View key={skill} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                    <AppText variant="caption" weight="bold">
                      {meta.label}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.textSoft}>
                    {played ? `${Math.round(value * 100)}%` : 'Not played yet'}
                  </AppText>
                </View>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(16,42,67,0.07)' }}>
                  <View
                    style={{
                      width: `${Math.max(2, value * 100)}%`,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: meta.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
          <AppText variant="caption" color={colors.textSoft}>
            Puzzle performance from your recent games.
          </AppText>
        </AppCard>

        {/* Cosmetics */}
        <AppCard style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="bodyLarge" weight="extraBold">
              Tino’s Collection
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="server" size={16} color="#E5A33C" />
              <AppText variant="body" weight="extraBold">
                {progress.coins}
              </AppText>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TinoMascot size={110} mood="happy" />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' }}>
            {COSMETICS.map((cosmetic) => {
              const unlocked = progress.unlockedCosmetics.includes(cosmetic.id);
              const equipped = progress.selectedCosmetics[cosmetic.slot] === cosmetic.id;
              const affordable = progress.coins >= cosmetic.cost;
              return (
                <Pressable
                  key={cosmetic.id}
                  accessibilityLabel={
                    unlocked
                      ? `${cosmetic.name}${equipped ? ', equipped' : ''}`
                      : `${cosmetic.name}, costs ${cosmetic.cost} coins`
                  }
                  onPress={() => {
                    if (unlocked) {
                      playSound('tap');
                      selectCosmetic(cosmetic.slot, cosmetic.id);
                    } else if (unlockCosmetic(cosmetic.id)) {
                      playSound('complete');
                      successHaptic();
                    } else {
                      warningHaptic();
                    }
                  }}
                  style={{
                    width: 96,
                    borderRadius: radius.tile,
                    backgroundColor: equipped ? `${cosmetic.color}22` : colors.background,
                    borderWidth: 2,
                    borderColor: equipped ? cosmetic.color : colors.border,
                    alignItems: 'center',
                    padding: spacing.sm,
                    gap: 4,
                    opacity: unlocked || affordable ? 1 : 0.55,
                  }}
                >
                  <Ionicons
                    name={cosmetic.icon as keyof typeof Ionicons.glyphMap}
                    size={26}
                    color={cosmetic.color}
                  />
                  <AppText variant="caption" weight="bold" center>
                    {cosmetic.name}
                  </AppText>
                  {equipped ? (
                    <AppText variant="caption" color={colors.success}>
                      Equipped
                    </AppText>
                  ) : unlocked ? (
                    <AppText variant="caption" color={colors.textSoft}>
                      Tap to wear
                    </AppText>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Ionicons name="server" size={12} color="#E5A33C" />
                      <AppText variant="caption" color={colors.textSoft}>
                        {cosmetic.cost}
                      </AppText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </AppCard>
      </ScrollView>
    </ScreenBackground>
  );
}
