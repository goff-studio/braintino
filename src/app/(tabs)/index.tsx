import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { AssessmentEntryCard } from '@/components/AssessmentEntryCard';
import { PersonalPlanCard } from '@/components/PersonalPlanCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StatCard } from '@/components/StatCard';
import { StatPill } from '@/components/StatPill';
import { TomorrowPreview } from '@/components/TomorrowPreview';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MINI_GAMES } from '@/data/miniGames';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { streakSaveMessage } from '@/game/engines/habitLoop';
import { getWeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';
import { currentWeekKeys, todayKey, tomorrowKey } from '@/utils/date';

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const settings = useGameStore((s) => s.settings);
  const personalPlan = settings.personalPlan;
  const startDailySession = useGameStore((s) => s.startDailySession);
  const lastAssessment = useGameStore((s) => s.lastAssessment);

  const today = todayKey();
  const plan = useMemo(
    () => getTodayDailyPlan(today, progress, personalPlan),
    [today, progress, personalPlan]
  );
  const tomorrowPlan = useMemo(
    () => getTodayDailyPlan(tomorrowKey(), progress, personalPlan),
    [progress, personalPlan]
  );
  const weeklyPlan = useMemo(
    () =>
      getWeeklyChallengePlan(progress, {
        onboardingDone: settings.onboardingDone,
        lastDailyCompletedDate: progress.lastDailyCompletedDate,
        globalLevel: progress.globalLevel,
      }),
    [progress, settings.onboardingDone]
  );
  const dailyDone = progress.lastDailyCompletedDate === today;

  const openWeekly = () => {
    router.push('/weekly');
  };

  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

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
          gap: spacing.xl,
        }}
      >
        {/* Header */}
        <Reveal index={0} style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <AppText variant="caption" weight="semiBold" color={colors.textMuted} style={{ letterSpacing: 0.8 }}>
              {dateLabel}
            </AppText>
            <AppText variant="display">Today</AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.xs }}>
            <StatPill
              icon="flame-outline"
              value={String(progress.streak)}
              accessibilityLabel={`${progress.streak}-day streak`}
            />
            <StatPill
              icon="trending-up"
              value={`Lv ${progress.globalLevel}`}
              accessibilityLabel={`Practice level ${progress.globalLevel}`}
            />
          </View>
        </Reveal>

        {personalPlan && (
          <Reveal index={1}>
            <PersonalPlanCard plan={personalPlan} compact />
          </Reveal>
        )}

        {/* Today's session — hero card */}
        <Reveal index={personalPlan ? 2 : 1}>
        <AppCard hero style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <AppText
              variant="caption"
              weight="semiBold"
              color={colors.textOnDarkSoft}
              style={{ letterSpacing: 0.6 }}
            >
              DAILY PRACTICE
            </AppText>
            <AppText variant="title" color={colors.textOnDark}>
              Today’s Session
            </AppText>
            <AppText variant="body" color={colors.textOnDarkSoft}>
              {dailyDone
                ? 'Completed · tomorrow is ready'
                : `${plan.title} · 3 exercises · about 5 minutes`}
            </AppText>
          </View>

          {dailyDone ? (
            <>
              <View style={{ alignItems: 'center', gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                  <AppText variant="bodyLarge" weight="bold" color={colors.textOnDark}>
                    Today’s session completed
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.textOnDarkSoft} center>
                  {streakSaveMessage(progress.streak)}
                </AppText>
              </View>
              <TomorrowPreview plan={tomorrowPlan} tone="dark" />
            </>
          ) : (
            <>
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
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: 16,
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <Ionicons
                        name={game.icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={colors.textOnDark}
                      />
                      <AppText variant="caption" weight="semiBold" color={colors.textOnDarkSoft}>
                        {game.shortTitle}
                      </AppText>
                    </View>
                  );
                })}
              </View>
              <AppButton
                title="Start Daily Practice"
                icon="play"
                tone="lime"
                onPress={() => {
                  startDailySession();
                  router.push('/daily');
                }}
              />
            </>
          )}
        </AppCard>
        </Reveal>

        {/* Stats */}
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Reveal index={2} style={{ flex: 1 }}>
              <StatCard icon="time-outline" value={`${weeklyMinutes}m`} label="This week" style={{ flex: 1 }} />
            </Reveal>
            <Reveal index={3} style={{ flex: 1 }}>
              <StatCard
                icon="flame-outline"
                value={String(progress.streak)}
                label="Practice streak"
                color={colors.warning}
                style={{ flex: 1 }}
              />
            </Reveal>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Reveal index={4} style={{ flex: 1 }}>
              <StatCard
                icon="checkmark-done-outline"
                value={String(progress.totalSessions)}
                label="Sessions"
                color={colors.success}
                style={{ flex: 1 }}
              />
            </Reveal>
            <Reveal index={5} style={{ flex: 1 }}>
              <StatCard
                icon="trending-up"
                value={String(progress.globalLevel)}
                label="Practice level"
                color={colors.secondary}
                style={{ flex: 1 }}
              />
            </Reveal>
          </View>
        </View>

        {dailyDone ? (
          <>
            <Reveal index={6}>
              <WeeklyChallengeCard plan={weeklyPlan} onPress={openWeekly} />
            </Reveal>
            <Reveal index={7}>
              <AppCard style={{ gap: spacing.md }}>
                <View style={{ gap: 2 }}>
                  <AppText
                    variant="caption"
                    weight="semiBold"
                    color={colors.textMuted}
                    style={{ letterSpacing: 0.6 }}
                  >
                    FREE PLAY
                  </AppText>
                  <AppText variant="bodyLarge" weight="bold">
                    Keep going
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft}>
                    Today’s session is done. Play any unlocked exercise, or take a Focus Snapshot.
                  </AppText>
                </View>
                <AppButton
                  title="Free play an exercise"
                  icon="grid-outline"
                  onPress={() => router.push('/practice')}
                />
                <AppButton
                  title={lastAssessment ? 'Retake Focus Snapshot' : 'Take Focus Snapshot'}
                  icon="flash-outline"
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/assessment', params: { source: 'today' } })}
                />
              </AppCard>
            </Reveal>
          </>
        ) : (
          <>
            <Reveal index={6}>
              <WeeklyChallengeCard plan={weeklyPlan} onPress={openWeekly} />
            </Reveal>
            <Reveal index={7}>
              <AssessmentEntryCard
                lastScore={lastAssessment?.score}
                onPress={() => router.push({ pathname: '/assessment', params: { source: 'today' } })}
              />
            </Reveal>
            <Reveal index={8}>
              <AppButton
                title="Free play exercises"
                icon="grid-outline"
                variant="secondary"
                onPress={() => router.push('/practice')}
              />
            </Reveal>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
