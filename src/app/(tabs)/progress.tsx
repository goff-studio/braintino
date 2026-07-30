import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { MilestoneList } from '@/components/MilestoneList';
import { ProgressRing } from '@/components/ProgressRing';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SKILL_META } from '@/components/SkillChip';
import { StatPill } from '@/components/StatPill';
import { WeeklyChart } from '@/components/WeeklyChart';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { rankForLevel, xpForLevel } from '@/data/levels';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import type { SkillType } from '@/types/game';
import { currentWeekKeys } from '@/utils/date';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);

  const weekKeys = currentWeekKeys();

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

  // Weekly Practice Score: mean of per-day practice-score means this week.
  const weeklyPracticeScore = useMemo(() => {
    const dayMeans = weekKeys
      .map((key) => progress.practiceByDate[key])
      .filter((d): d is { total: number; count: number } => !!d && d.count > 0)
      .map((d) => d.total / d.count);
    if (dayMeans.length === 0) return null;
    return Math.round(dayMeans.reduce((a, b) => a + b, 0) / dayMeans.length);
  }, [progress.practiceByDate, weekKeys]);

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
        <Reveal index={0}>
          <AppText variant="heading">Progress</AppText>
        </Reveal>

        {/* Practice level */}
        <Reveal index={1}>
        <AppCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <ProgressRing
            progress={progress.xp / xpNeeded}
            size={92}
            label={`${progress.globalLevel}`}
            color={colors.primary}
          />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="title">{rankForLevel(progress.globalLevel)}</AppText>
            <AppText variant="caption" color={colors.textSoft}>
              {progress.xp}/{xpNeeded} XP to level {progress.globalLevel + 1}
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4, flexWrap: 'wrap' }}>
              <StatPill
                icon="flame-outline"
                value={`${progress.streak}-day streak`}
                accessibilityLabel={`${progress.streak}-day streak`}
              />
              <StatPill
                icon="checkmark-done-outline"
                value={`${progress.totalSessions}`}
                accessibilityLabel={`${progress.totalSessions} sessions completed`}
              />
            </View>
          </View>
        </AppCard>
        </Reveal>

        {/* This week */}
        <Reveal index={2}>
        <AppCard style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="bodyLarge" weight="bold">
              This Week
            </AppText>
            {weeklyPracticeScore !== null && (
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="title" weight="bold" color={colors.primary}>
                  {weeklyPracticeScore}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  Practice Score
                </AppText>
              </View>
            )}
          </View>
          <WeeklyChart minutesByDate={progress.minutesByDate} />
          <AppText variant="caption" color={colors.textSoft}>
            {weeklyMinutes} min this week · {progress.totalSessions} sessions total
          </AppText>
        </AppCard>
        </Reveal>

        {/* Skill balance */}
        <Reveal index={3}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="bold">
            Skill Balance
          </AppText>
          {skillBalance.map(({ skill, value, played }) => {
            const meta = SKILL_META[skill];
            return (
              <View key={skill} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                    <AppText variant="caption" weight="semiBold">
                      {meta.label}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.textSoft}>
                    {played ? `${Math.round(value * 100)}%` : 'No data yet'}
                  </AppText>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.trackFaint }}>
                  <View
                    style={{
                      width: `${Math.max(2, value * 100)}%`,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: meta.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
          <AppText variant="caption" color={colors.textMuted}>
            Based on accuracy in your recent sessions.
          </AppText>
        </AppCard>
        </Reveal>

        {/* Milestones */}
        <Reveal index={4}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="bold">
            Recent Milestones
          </AppText>
          <MilestoneList earnedBadges={progress.earnedBadges} />
        </AppCard>
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
