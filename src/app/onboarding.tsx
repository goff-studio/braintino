import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { PersonalPlanCard } from '@/components/PersonalPlanCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SelectableRow } from '@/components/SelectableRow';
import { ToggleRow } from '@/components/ToggleRow';
import { gradients } from '@/constants/colors';
import { radius, spacing, tapTarget } from '@/constants/spacing';
import { AGE_OPTIONS, GOAL_OPTIONS, WEAK_SPOT_OPTIONS } from '@/data/personalPlan';
import { generatePersonalPlan } from '@/game/engines/personalPlan';
import { useTheme } from '@/hooks/useTheme';
import {
  ONBOARDING_STEPS,
  trackOnboardingStepViewed,
  trackPlanGenerated,
  type OnboardingNext,
} from '@/services/analytics/onboardingEvents';
import { tapHaptic } from '@/services/haptics/haptics';
import { useGameStore } from '@/store/useGameStore';
import { formatClock } from '@/i18n/copy';
import type { PlanAgeBand, PlanGoal, PlanWeakSpot } from '@/types/plan';
import type { ReminderFrequency } from '@/types/settings';

const REMINDER_FREQUENCIES: ReminderFrequency[] = ['daily', 'everyOtherDay', 'weekdays'];

const REMINDER_TIMES: { id: 'morning' | 'afternoon' | 'evening'; hour: number; minute: number }[] = [
  { id: 'morning', hour: 9, minute: 0 },
  { id: 'afternoon', hour: 14, minute: 0 },
  { id: 'evening', hour: 19, minute: 0 },
];

const PLAN_STEP = ONBOARDING_STEPS.length - 1;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const setPracticeReminder = useGameStore((s) => s.setPracticeReminder);
  const startDailySession = useGameStore((s) => s.startDailySession);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<PlanGoal | null>(null);
  const [ageBand, setAgeBand] = useState<PlanAgeBand | null>(null);
  const [weakSpots, setWeakSpots] = useState<PlanWeakSpot[]>([]);
  const [biggerText, setBiggerText] = useState(false);
  const [reduceMotionPref, setReduceMotionPref] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showA11y, setShowA11y] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('daily');
  const [reminderTime, setReminderTime] = useState(REMINDER_TIMES[0]);
  const [requestingReminder, setRequestingReminder] = useState(false);

  const plan = useMemo(
    () =>
      generatePersonalPlan({
        goal: goal ?? 'habit',
        ageBand: ageBand ?? 'prefer_not',
        weakSpots,
        timeMinutes: 5,
      }),
    [goal, ageBand, weakSpots]
  );

  useEffect(() => {
    trackOnboardingStepViewed(ONBOARDING_STEPS[step], step);
  }, [step]);

  useEffect(() => {
    if (step !== PLAN_STEP) return;
    trackPlanGenerated(plan);
  }, [step, plan]);

  const toggleWeakSpot = (id: PlanWeakSpot) => {
    setWeakSpots((current) =>
      current.includes(id) ? current.filter((spot) => spot !== id) : [...current, id]
    );
  };

  const enableReminder = async () => {
    if (requestingReminder) return;
    setRequestingReminder(true);
    try {
      // Requests the OS permission, then schedules everything on-device.
      // Denied or blocked → move on quietly; it can be enabled in Profile.
      await setPracticeReminder(true, {
        frequency: reminderFrequency,
        hour: reminderTime.hour,
        minute: reminderTime.minute,
        source: 'onboarding',
      });
    } finally {
      setRequestingReminder(false);
    }
    setStep(PLAN_STEP);
  };

  const finish = (next: OnboardingNext) => {
    // Store logs onboarding_completed (funnel + personalization fields + traffic_source).
    completeOnboarding(
      plan.difficultyMode,
      {
        biggerText,
        reducedMotion: reduceMotionPref,
        highContrast,
        personalPlan: plan,
      },
      next
    );
    if (next === 'assessment') {
      router.replace({ pathname: '/assessment', params: { source: 'onboarding' } });
      return;
    }
    if (next === 'first_session') {
      startDailySession();
      router.replace('/daily');
      return;
    }
    router.replace(next === 'calibration' ? '/calibration' : '/(tabs)');
  };

  return (
    <ScreenBackground gradient={gradients.home}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          justifyContent: 'center',
          gap: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={() => {
                tapHaptic();
                setStep((current) => Math.max(0, current - 1));
              }}
              style={{
                width: tapTarget.min,
                height: tapTarget.min,
                borderRadius: tapTarget.min / 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ) : (
            <View style={{ width: tapTarget.min }} />
          )}
          <View style={{ flex: 1, flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' }}>
            {ONBOARDING_STEPS.map((id, i) => (
              <View
                key={id}
                style={{
                  width: i === step ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i <= step ? colors.primary : colors.trackFaint,
                }}
              />
            ))}
          </View>
          <View style={{ width: tapTarget.min }} />
        </View>

        {step === 0 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit style={{ alignItems: 'center', gap: spacing.md }}>
              <BrandMark size={96} />
              <AppText variant="display" center>
                Braintino
              </AppText>
              <AppText
                variant="caption"
                weight="semiBold"
                color={colors.textMuted}
                center
                style={{ letterSpacing: 1.2 }}
              >
                {t('common.brandTag')}
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="bodyLarge" color={colors.textSoft} center>
                {t('onboarding.intro')}
              </AppText>
            </Reveal>
            <Reveal index={2} exit>
              <AppText variant="caption" color={colors.textMuted} center>
                {t('plan.disclaimer')}
              </AppText>
            </Reveal>
            <Reveal index={3} exit>
              <AppButton title={t('onboarding.getStarted')} icon="arrow-forward" onPress={() => setStep(1)} />
            </Reveal>
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                {t('onboarding.goalTitle')}
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                {t('onboarding.goalBody')}
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {GOAL_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={t(`onboarding.goals.${option.id}.label`)}
                    description={t(`onboarding.goals.${option.id}.description`)}
                    icon={option.icon}
                    selected={goal === option.id}
                    onPress={() => setGoal(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton
                title={t('common.continue')}
                icon="arrow-forward"
                disabled={!goal}
                onPress={() => setStep(2)}
              />
            </Reveal>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                {t('onboarding.ageTitle')}
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                {t('onboarding.ageBody')}
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {AGE_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={t(`onboarding.ages.${option.id}.label`)}
                    description={t(`onboarding.ages.${option.id}.description`)}
                    icon={option.icon}
                    selected={ageBand === option.id}
                    onPress={() => setAgeBand(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton
                title={t('common.continue')}
                icon="arrow-forward"
                disabled={!ageBand}
                onPress={() => setStep(3)}
              />
            </Reveal>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                {t('onboarding.weakTitle')}
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                {t('onboarding.weakBody')}
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {WEAK_SPOT_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={t(`onboarding.weakSpots.${option.id}.label`)}
                    description={t(`onboarding.weakSpots.${option.id}.description`)}
                    icon={option.icon}
                    selected={weakSpots.includes(option.id)}
                    accessibilityHint={t('onboarding.weakHint')}
                    onPress={() => toggleWeakSpot(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton
                title={t('common.continue')}
                icon="arrow-forward"
                disabled={weakSpots.length === 0}
                onPress={() => setStep(4)}
              />
            </Reveal>
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppCard style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 22,
                    backgroundColor: colors.chipBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="time-outline" size={32} color={colors.primary} />
                </View>
                <AppText variant="title" center>
                  {t('onboarding.timeTitle')}
                </AppText>
                <AppText variant="body" color={colors.textSoft} center>
                  {t('onboarding.timeBody')}
                </AppText>
              </AppCard>
            </Reveal>
            <Reveal index={1} exit>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  borderRadius: radius.card,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  backgroundColor: colors.chipBlue,
                  padding: spacing.lg,
                  minHeight: 76,
                }}
              >
                <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyLarge" weight="bold">
                    {t('onboarding.timeSelected')}
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft}>
                    {t('onboarding.timeSelectedBody')}
                  </AppText>
                </View>
              </View>
            </Reveal>
            <Reveal index={2} exit>
              <AppButton title={t('onboarding.timeCta')} icon="arrow-forward" onPress={() => setStep(5)} />
            </Reveal>
          </View>
        )}

        {step === 5 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppCard style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 22,
                    backgroundColor: colors.chipBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="alarm-outline" size={32} color={colors.primary} />
                </View>
                <AppText variant="title" center>
                  {t('onboarding.reminderTitle')}
                </AppText>
                <AppText variant="body" color={colors.textSoft} center>
                  {t('onboarding.reminderBody')}
                </AppText>
              </AppCard>
            </Reveal>

            <Reveal index={1} exit>
              <View style={{ gap: spacing.sm }}>
                <AppText variant="caption" weight="semiBold" color={colors.textMuted}>
                  {t('onboarding.howOften')}
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {REMINDER_FREQUENCIES.map((freq) => {
                    const active = reminderFrequency === freq;
                    return (
                      <Pressable
                        key={freq}
                        accessibilityRole="button"
                        accessibilityLabel={`${t(`profile.frequencies.${freq}.label`)}: ${t(`profile.frequencies.${freq}.description`)}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                          tapHaptic();
                          setReminderFrequency(freq);
                        }}
                        style={{
                          flex: 1,
                          borderRadius: radius.button,
                          borderWidth: 1.5,
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.chipBlue : colors.card,
                          padding: spacing.md,
                          alignItems: 'center',
                          gap: 2,
                          minHeight: 64,
                        }}
                      >
                        <AppText variant="body" weight="bold" color={active ? colors.primary : colors.text}>
                          {t(`profile.frequencies.${freq}.label`)}
                        </AppText>
                        <AppText variant="caption" color={colors.textSoft} center>
                          {freq === 'daily'
                            ? t('onboarding.recommended')
                            : t(`profile.frequencies.${freq}.description`)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Reveal>

            <Reveal index={2} exit>
              <View style={{ gap: spacing.sm }}>
                <AppText variant="caption" weight="semiBold" color={colors.textMuted}>
                  {t('onboarding.whatTime')}
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {REMINDER_TIMES.map((time) => {
                    const clock = formatClock(time.hour, time.minute);
                    const active = reminderTime.id === time.id;
                    return (
                      <Pressable
                        key={time.id}
                        accessibilityRole="button"
                        accessibilityLabel={t('onboarding.remindA11y', {
                          period: t(`profile.times.${time.id}`),
                          time: clock,
                        })}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                          tapHaptic();
                          setReminderTime(time);
                        }}
                        style={{
                          flex: 1,
                          borderRadius: radius.button,
                          borderWidth: 1.5,
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.chipBlue : colors.card,
                          padding: spacing.md,
                          alignItems: 'center',
                          gap: 2,
                          minHeight: 64,
                        }}
                      >
                        <AppText variant="body" weight="bold" color={active ? colors.primary : colors.text}>
                          {t(`profile.times.${time.id}`)}
                        </AppText>
                        <AppText variant="caption" color={colors.textSoft} center>
                          {clock}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Reveal>

            <Reveal index={3} exit>
              <AppButton
                title={
                  reminderFrequency === 'daily'
                    ? t('onboarding.remindDaily', { time: formatClock(reminderTime.hour, reminderTime.minute) })
                    : reminderFrequency === 'weekdays'
                      ? t('onboarding.remindWeekdays', { time: formatClock(reminderTime.hour, reminderTime.minute) })
                      : t('onboarding.remindAlternate', { time: formatClock(reminderTime.hour, reminderTime.minute) })
                }
                icon="notifications-outline"
                disabled={requestingReminder}
                onPress={enableReminder}
              />
            </Reveal>
            <Reveal index={4} exit>
              <AppButton title={t('common.notNow')} variant="ghost" onPress={() => setStep(PLAN_STEP)} />
            </Reveal>
          </View>
        )}

        {step === PLAN_STEP && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                {t('onboarding.planTitle')}
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <PersonalPlanCard plan={plan} />
            </Reveal>
            <Reveal index={2} exit>
              <AppCard style={{ gap: spacing.xs }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showA11y }}
                  accessibilityLabel={t('onboarding.a11yOptions')}
                  onPress={() => {
                    tapHaptic();
                    setShowA11y((open) => !open);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: tapTarget.min,
                  }}
                >
                  <AppText variant="caption" weight="semiBold" color={colors.textMuted}>
                    {t('onboarding.a11y')}
                  </AppText>
                  <Ionicons
                    name={showA11y ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
                {showA11y && (
                  <>
                    <ToggleRow
                      label={t('profile.biggerText')}
                      description={t('profile.biggerTextBody')}
                      icon="text-outline"
                      value={biggerText}
                      onValueChange={setBiggerText}
                    />
                    <ToggleRow
                      label={t('profile.reducedMotion')}
                      description={t('profile.reducedMotionBody')}
                      icon="pause-circle-outline"
                      value={reduceMotionPref}
                      onValueChange={setReduceMotionPref}
                    />
                    <ToggleRow
                      label={t('profile.highContrast')}
                      description={t('profile.highContrastBody')}
                      icon="contrast-outline"
                      value={highContrast}
                      onValueChange={setHighContrast}
                    />
                    <AppText variant="caption" color={colors.textMuted}>
                      {t('onboarding.a11yStay')}
                    </AppText>
                  </>
                )}
              </AppCard>
            </Reveal>
            <Reveal index={3} exit>
              <AppButton title={t('onboarding.findLevel')} icon="play" onPress={() => finish('calibration')} />
            </Reveal>
            <Reveal index={4} exit>
              <AppButton
                title={t('onboarding.startToday')}
                icon="sunny-outline"
                variant="secondary"
                onPress={() => finish('first_session')}
              />
            </Reveal>
            <Reveal index={5} exit>
              <AppButton
                title={t('onboarding.trySnapshot')}
                icon="flash-outline"
                variant="secondary"
                onPress={() => finish('assessment')}
              />
            </Reveal>
            <Reveal index={6} exit>
              <AppButton title={t('common.skipForNow')} variant="ghost" onPress={() => finish('today')} />
            </Reveal>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
