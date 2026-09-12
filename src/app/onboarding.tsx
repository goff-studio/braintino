import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  trackOnboardingCompleted,
  trackOnboardingStepViewed,
  trackPlanGenerated,
  type OnboardingNext,
} from '@/services/analytics/onboardingEvents';
import { tapHaptic } from '@/services/haptics/haptics';
import { useGameStore } from '@/store/useGameStore';
import { PLAN_DISCLAIMER, type PlanAgeBand, type PlanGoal, type PlanWeakSpot } from '@/types/plan';
import type { ReminderFrequency } from '@/types/settings';

const REMINDER_FREQUENCIES: { id: ReminderFrequency; label: string; description: string }[] = [
  { id: 'daily', label: 'Daily', description: 'Every day' },
  { id: 'everyOtherDay', label: 'Alternate', description: 'Every other day' },
  { id: 'weekdays', label: 'Weekdays', description: 'Mon – Fri' },
];

const REMINDER_TIMES: { label: string; description: string; hour: number; minute: number }[] = [
  { label: 'Morning', description: '9:00 AM', hour: 9, minute: 0 },
  { label: 'Afternoon', description: '2:00 PM', hour: 14, minute: 0 },
  { label: 'Evening', description: '7:00 PM', hour: 19, minute: 0 },
];

const PLAN_STEP = ONBOARDING_STEPS.length - 1;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const setPracticeReminder = useGameStore((s) => s.setPracticeReminder);
  const startDailySession = useGameStore((s) => s.startDailySession);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<PlanGoal>('habit');
  const [ageBand, setAgeBand] = useState<PlanAgeBand>('prefer_not');
  const [weakSpots, setWeakSpots] = useState<PlanWeakSpot[]>([]);
  const [biggerText, setBiggerText] = useState(false);
  const [reduceMotionPref, setReduceMotionPref] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showA11y, setShowA11y] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('daily');
  const [reminderTime, setReminderTime] = useState(REMINDER_TIMES[0]);
  const [requestingReminder, setRequestingReminder] = useState(false);

  const plan = useMemo(
    () => generatePersonalPlan({ goal, ageBand, weakSpots, timeMinutes: 5 }),
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
    completeOnboarding(plan.difficultyMode, {
      biggerText,
      reducedMotion: reduceMotionPref,
      highContrast,
      personalPlan: plan,
    });
    trackOnboardingCompleted({
      next,
      plan,
      reminderEnabled: useGameStore.getState().settings.reminderEnabled,
    });
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
              accessibilityLabel="Back"
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
                DAILY COGNITIVE PRACTICE
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="bodyLarge" color={colors.textSoft} center>
                A few quick questions and we&apos;ll build a five-minute personal plan — for fun and
                self-insight, not a diagnosis.
              </AppText>
            </Reveal>
            <Reveal index={2} exit>
              <AppText variant="caption" color={colors.textMuted} center>
                {PLAN_DISCLAIMER}
              </AppText>
            </Reveal>
            <Reveal index={3} exit>
              <AppButton title="Get Started" icon="arrow-forward" onPress={() => setStep(1)} />
            </Reveal>
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                What do you want to work on?
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                Pick the practice vibe that sounds most useful. You can change pace later.
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {GOAL_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={option.label}
                    description={option.description}
                    icon={option.icon}
                    selected={goal === option.id}
                    onPress={() => setGoal(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton title="Continue" icon="arrow-forward" onPress={() => setStep(2)} />
            </Reveal>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                Which age band fits?
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                This only seeds a comfortable starting pace — never a score or diagnosis.
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {AGE_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={option.label}
                    description={option.description}
                    icon={option.icon}
                    selected={ageBand === option.id}
                    onPress={() => setAgeBand(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton title="Continue" icon="arrow-forward" onPress={() => setStep(3)} />
            </Reveal>
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                Where should we lean in?
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                Choose one or more. These are practice preferences, not symptoms.
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {WEAK_SPOT_OPTIONS.map((option, i) => (
                <Reveal key={option.id} index={i + 2} exit>
                  <SelectableRow
                    label={option.label}
                    description={option.description}
                    icon={option.icon}
                    selected={weakSpots.includes(option.id)}
                    accessibilityHint="Toggles this preference on or off"
                    onPress={() => toggleWeakSpot(option.id)}
                  />
                </Reveal>
              ))}
            </View>
            <Reveal index={7} exit>
              <AppButton
                title="Continue"
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
                  Five minutes a day
                </AppText>
                <AppText variant="body" color={colors.textSoft} center>
                  That&apos;s the whole daily session — three short exercises. No longer homework, no
                  extra time commitment.
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
                    5 minutes
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft}>
                    The existing daily loop — already selected
                  </AppText>
                </View>
              </View>
            </Reveal>
            <Reveal index={2} exit>
              <AppButton title="Five minutes works" icon="arrow-forward" onPress={() => setStep(5)} />
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
                  Make it a routine
                </AppText>
                <AppText variant="body" color={colors.textSoft} center>
                  Practice sticks when it&apos;s regular. Daily at 9:00 AM is already selected — confirm
                  the nudge, or skip. Reminders stay on this device.
                </AppText>
              </AppCard>
            </Reveal>

            <Reveal index={1} exit>
              <View style={{ gap: spacing.sm }}>
                <AppText variant="caption" weight="semiBold" color={colors.textMuted}>
                  HOW OFTEN
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {REMINDER_FREQUENCIES.map((freq) => {
                    const active = reminderFrequency === freq.id;
                    return (
                      <Pressable
                        key={freq.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${freq.label}: ${freq.description}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                          tapHaptic();
                          setReminderFrequency(freq.id);
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
                          {freq.label}
                        </AppText>
                        <AppText variant="caption" color={colors.textSoft} center>
                          {freq.id === 'daily' ? 'Recommended' : freq.description}
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
                  WHAT TIME
                </AppText>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {REMINDER_TIMES.map((time) => {
                    const active = reminderTime.label === time.label;
                    return (
                      <Pressable
                        key={time.label}
                        accessibilityRole="button"
                        accessibilityLabel={`Remind me in the ${time.label.toLowerCase()} at ${time.description}`}
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
                          {time.label}
                        </AppText>
                        <AppText variant="caption" color={colors.textSoft} center>
                          {time.description}
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
                    ? `Remind me daily at ${reminderTime.description}`
                    : reminderFrequency === 'weekdays'
                      ? `Remind me weekdays at ${reminderTime.description}`
                      : `Remind me every other day at ${reminderTime.description}`
                }
                icon="notifications-outline"
                disabled={requestingReminder}
                onPress={enableReminder}
              />
            </Reveal>
            <Reveal index={4} exit>
              <AppButton title="Not now" variant="ghost" onPress={() => setStep(PLAN_STEP)} />
            </Reveal>
          </View>
        )}

        {step === PLAN_STEP && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                Your personal plan
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
                  accessibilityLabel="Accessibility options"
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
                    ACCESSIBILITY
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
                      label="Bigger text"
                      description="Larger text throughout the app"
                      icon="text-outline"
                      value={biggerText}
                      onValueChange={setBiggerText}
                    />
                    <ToggleRow
                      label="Reduced motion"
                      description="Minimal animations"
                      icon="pause-circle-outline"
                      value={reduceMotionPref}
                      onValueChange={setReduceMotionPref}
                    />
                    <ToggleRow
                      label="High contrast"
                      description="Stronger colors and outlines"
                      icon="contrast-outline"
                      value={highContrast}
                      onValueChange={setHighContrast}
                    />
                    <AppText variant="caption" color={colors.textMuted}>
                      These stay available in Profile anytime.
                    </AppText>
                  </>
                )}
              </AppCard>
            </Reveal>
            <Reveal index={3} exit>
              <AppButton title="Find My Level" icon="play" onPress={() => finish('calibration')} />
            </Reveal>
            <Reveal index={4} exit>
              <AppButton
                title="Start today’s session"
                icon="sunny-outline"
                variant="secondary"
                onPress={() => finish('first_session')}
              />
            </Reveal>
            <Reveal index={5} exit>
              <AppButton
                title="Try a Focus Snapshot"
                icon="flash-outline"
                variant="secondary"
                onPress={() => finish('assessment')}
              />
            </Reveal>
            <Reveal index={6} exit>
              <AppButton title="Skip for now" variant="ghost" onPress={() => finish('today')} />
            </Reveal>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
