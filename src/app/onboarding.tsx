import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ToggleRow } from '@/components/ToggleRow';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { useGameStore } from '@/store/useGameStore';
import type { DifficultyMode, ReminderFrequency } from '@/types/settings';

const MODES: { id: DifficultyMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'relaxed', label: 'Relaxed', description: 'More time per prompt, calmer pace', icon: 'cafe-outline' },
  { id: 'balanced', label: 'Balanced', description: 'The standard adult baseline', icon: 'speedometer-outline' },
  { id: 'challenging', label: 'Challenging', description: 'Faster pace, higher demand', icon: 'flash-outline' },
];

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

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);
  const setPracticeReminder = useGameStore((s) => s.setPracticeReminder);

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<DifficultyMode>('balanced');
  const [biggerText, setBiggerText] = useState(false);
  const [reduceMotionPref, setReduceMotionPref] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('daily');
  const [reminderTime, setReminderTime] = useState(REMINDER_TIMES[0]);
  const [requestingReminder, setRequestingReminder] = useState(false);

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
      });
    } finally {
      setRequestingReminder(false);
    }
    setStep(3);
  };

  const finish = (playFirst: boolean) => {
    completeOnboarding(mode, {
      biggerText,
      reducedMotion: reduceMotionPref,
      highContrast,
    });
    if (playFirst) {
      startPracticeSession('focus_flash');
      router.replace('/play/focus_flash');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenBackground gradient={gradients.home}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          justifyContent: 'center',
          gap: spacing.lg,
        }}
      >
        {/* Step dots */}
        <View style={{ flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: i === step ? 22 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i <= step ? colors.primary : colors.trackFaint,
              }}
            />
          ))}
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
                Five minutes a day of short, structured exercises for attention, memory, and processing
                speed — adapted to your level.
              </AppText>
            </Reveal>
            <Reveal index={2} exit>
              <AppButton title="Get Started" icon="arrow-forward" onPress={() => setStep(1)} />
            </Reveal>
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: spacing.lg }}>
            <Reveal index={0} exit>
              <AppText variant="title" center>
                Set your pace
              </AppText>
            </Reveal>
            <Reveal index={1} exit>
              <AppText variant="body" color={colors.textSoft} center>
                You can change this anytime in Profile.
              </AppText>
            </Reveal>
            <View style={{ gap: spacing.md }}>
              {MODES.map((m, i) => {
                const active = mode === m.id;
                return (
                  <Reveal key={m.id} index={i + 2} exit>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${m.label}: ${m.description}`}
                    onPress={() => {
                      tapHaptic();
                      setMode(m.id);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      borderRadius: radius.card,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.chipBlue : colors.card,
                      padding: spacing.lg,
                      minHeight: 76,
                    }}
                  >
                    <Ionicons name={m.icon} size={26} color={active ? colors.primary : colors.textSoft} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyLarge" weight="bold">
                        {m.label}
                      </AppText>
                      <AppText variant="caption" color={colors.textSoft}>
                        {m.description}
                      </AppText>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
                  </Pressable>
                  </Reveal>
                );
              })}
            </View>
            <Reveal index={5} exit>
            <AppCard style={{ gap: spacing.xs }}>
              <AppText variant="caption" weight="semiBold" color={colors.textMuted} style={{ marginBottom: spacing.xs }}>
                ACCESSIBILITY
              </AppText>
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
            </AppCard>
            </Reveal>
            <Reveal index={6} exit>
              <AppButton title="Continue" icon="arrow-forward" onPress={() => setStep(2)} />
            </Reveal>
          </View>
        )}

        {step === 2 && (
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
                Practice sticks when it&apos;s regular. Want a nudge? Reminders are scheduled right
                on this device — nothing is sent anywhere.
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
                          {freq.description}
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
                title="Remind Me"
                icon="notifications-outline"
                disabled={requestingReminder}
                onPress={enableReminder}
              />
            </Reveal>
            <Reveal index={4} exit>
              <AppButton title="Maybe later" variant="ghost" onPress={() => setStep(3)} />
            </Reveal>
          </View>
        )}

        {step === 3 && (
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
                <Ionicons name="flash-outline" size={32} color={colors.primary} />
              </View>
              <AppText variant="title" center>
                Start with a 1-minute warm-up
              </AppText>
              <AppText variant="body" color={colors.textSoft} center>
                A quick processing-speed exercise establishes your starting level. Accuracy matters
                more than speed.
              </AppText>
            </AppCard>
            </Reveal>
            <Reveal index={1} exit>
              <AppButton title="Start First Exercise" icon="play" onPress={() => finish(true)} />
            </Reveal>
            <Reveal index={2} exit>
              <AppButton title="Explore the app first" variant="ghost" onPress={() => finish(false)} />
            </Reveal>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
