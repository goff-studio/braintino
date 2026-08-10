import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StatPill } from '@/components/StatPill';
import { ToggleRow } from '@/components/ToggleRow';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { rankForLevel } from '@/data/levels';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AdService } from '@/services/monetization/AdService';
import { PurchaseService } from '@/services/monetization/PurchaseService';
import { useGameStore } from '@/store/useGameStore';
import type { DifficultyMode, ReminderFrequency } from '@/types/settings';

const DIFFICULTY_MODES: { id: DifficultyMode; label: string; description: string }[] = [
  { id: 'relaxed', label: 'Relaxed', description: 'More time per prompt' },
  { id: 'balanced', label: 'Balanced', description: 'The standard pace' },
  { id: 'challenging', label: 'Challenging', description: 'Faster pace, higher demand' },
];

// Required by App Store Guideline 3.1.2: the subscription purchase flow must
// link to both documents, and the EULA link must also appear in the App Store
// description (standard Apple EULA).
const PRIVACY_POLICY_URL =
  'https://glimmer-locket-654.notion.site/Privacy-Policy-for-Braintino-393bc9cb57128085877fe98d8a4295e5';
const TERMS_OF_USE_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setPracticeReminder = useGameStore((s) => s.setPracticeReminder);
  const updateReminderConfig = useGameStore((s) => s.updateReminderConfig);
  const resetAllProgress = useGameStore((s) => s.resetAllProgress);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [reminderBlocked, setReminderBlocked] = useState(false);

  const adFree = useGameStore((s) => s.adFree);
  const [adFreePrice, setAdFreePrice] = useState<string | null>(null);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [purchaseNote, setPurchaseNote] = useState<string | null>(null);

  useEffect(() => {
    if (adFree || !PurchaseService.isAvailable()) return;
    let cancelled = false;
    PurchaseService.getAdFreePackage().then((pkg) => {
      if (!cancelled && pkg) setAdFreePrice(pkg.product.priceString);
    });
    return () => {
      cancelled = true;
    };
  }, [adFree]);

  const buyAdFree = async () => {
    if (purchaseBusy) return;
    setPurchaseBusy(true);
    setPurchaseNote(null);
    const outcome = await PurchaseService.purchaseAdFree();
    if (outcome === 'failed') {
      setPurchaseNote('Purchase didn’t go through. Nothing was charged — please try again.');
    }
    setPurchaseBusy(false);
  };

  const restoreAdFree = async () => {
    if (purchaseBusy) return;
    setPurchaseBusy(true);
    setPurchaseNote(null);
    const restored = await PurchaseService.restorePurchases();
    if (!restored) setPurchaseNote('No previous purchase found for this store account.');
    setPurchaseBusy(false);
  };

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
        <Reveal index={0}>
          <AppText variant="heading">Profile</AppText>
        </Reveal>

        <Reveal index={1}>
        <AppCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <BrandMark size={48} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="bodyLarge" weight="bold">
              Level {progress.globalLevel} · {rankForLevel(progress.globalLevel)}
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <StatPill
                icon="flame-outline"
                value={`${progress.streak}-day streak`}
                accessibilityLabel={`${progress.streak}-day streak`}
              />
            </View>
          </View>
        </AppCard>
        </Reveal>

        <Reveal index={2}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            Preferences
          </AppText>
          <ToggleRow
            label="Sounds"
            description="Feedback sounds during practice"
            icon="volume-medium-outline"
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
          />
          <ToggleRow
            label="Haptics"
            description="Vibration feedback"
            icon="phone-portrait-outline"
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
          />
        </AppCard>
        </Reveal>

        <Reveal index={3}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            Daily Reminder
          </AppText>
          <ToggleRow
            label="Practice reminder"
            description="A daily nudge at your chosen time. Nothing leaves your device."
            icon="alarm-outline"
            value={settings.reminderEnabled}
            onValueChange={(v) => {
              setPracticeReminder(v).then((result) => setReminderBlocked(result === 'blocked'));
            }}
          />
          {reminderBlocked && !settings.reminderEnabled && (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="caption" color={colors.textSoft}>
                Notifications are turned off for Braintino in your device settings.
              </AppText>
              <AppButton
                title="Open device settings"
                variant="ghost"
                onPress={() => Linking.openSettings()}
              />
            </View>
          )}
          {settings.reminderEnabled && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              {REMINDER_FREQUENCIES.map((freq) => {
                const active = settings.reminderFrequency === freq.id;
                return (
                  <Pressable
                    key={freq.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${freq.label}: ${freq.description}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      tapHaptic();
                      updateReminderConfig({ frequency: freq.id });
                    }}
                    style={{
                      flex: 1,
                      borderRadius: radius.button,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.chipBlue : 'transparent',
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
          )}
          {settings.reminderEnabled && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              {REMINDER_TIMES.map((time) => {
                const active =
                  settings.reminderHour === time.hour && settings.reminderMinute === time.minute;
                return (
                  <Pressable
                    key={time.label}
                    accessibilityRole="button"
                    accessibilityLabel={`Remind me in the ${time.label.toLowerCase()} at ${time.description}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      tapHaptic();
                      updateReminderConfig({ hour: time.hour, minute: time.minute });
                    }}
                    style={{
                      flex: 1,
                      borderRadius: radius.button,
                      borderWidth: 1.5,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.chipBlue : 'transparent',
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
          )}
        </AppCard>
        </Reveal>

        <Reveal index={4}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="bold">
            Difficulty Mode
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {DIFFICULTY_MODES.map((mode) => {
              const active = settings.difficultyMode === mode.id;
              return (
                <Pressable
                  key={mode.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${mode.label}: ${mode.description}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    tapHaptic();
                    updateSettings({ difficultyMode: mode.id });
                  }}
                  style={{
                    flex: 1,
                    borderRadius: radius.button,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.chipBlue : 'transparent',
                    padding: spacing.md,
                    alignItems: 'center',
                    gap: 2,
                    minHeight: 72,
                  }}
                >
                  <AppText variant="body" weight="bold" color={active ? colors.primary : colors.text}>
                    {mode.label}
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft} center>
                    {mode.description}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" color={colors.textMuted}>
            Difficulty also adapts automatically to your accuracy within each exercise.
          </AppText>
        </AppCard>
        </Reveal>

        <Reveal index={5}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            Accessibility
          </AppText>
          <ToggleRow
            label="Bigger text"
            description="Larger text throughout the app"
            icon="text-outline"
            value={settings.biggerText}
            onValueChange={(v) => updateSettings({ biggerText: v })}
          />
          <ToggleRow
            label="Reduced motion"
            description="Minimal animations"
            icon="pause-circle-outline"
            value={settings.reducedMotion}
            onValueChange={(v) => updateSettings({ reducedMotion: v })}
          />
          <ToggleRow
            label="High contrast"
            description="Stronger colors and outlines"
            icon="contrast-outline"
            value={settings.highContrast}
            onValueChange={(v) => updateSettings({ highContrast: v })}
          />
        </AppCard>
        </Reveal>

        <Reveal index={6}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            Privacy
          </AppText>
          <ToggleRow
            label="Analytics & personalized content"
            description="Helps us improve Braintino. Ads stay either way, just less relevant when off."
            icon="shield-checkmark-outline"
            value={settings.analyticsEnabled}
            onValueChange={(v) => updateSettings({ analyticsEnabled: v })}
          />
          {AdService.isPrivacyOptionsRequired() && (
            <AppButton
              title="Manage ad privacy"
              variant="ghost"
              onPress={() => AdService.showPrivacyOptions()}
            />
          )}
          <AppText variant="caption" color={colors.textMuted}>
            Ads keep Braintino free.
          </AppText>
        </AppCard>
        </Reveal>

        <Reveal index={7}>
        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="bold">
            Ad-Free
          </AppText>
          {adFree ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <AppText variant="body" color={colors.textSoft} style={{ flex: 1 }}>
                You’re ad-free. Thank you for supporting Braintino!
              </AppText>
            </View>
          ) : (
            <>
              <AppText variant="body" color={colors.textSoft}>
                A whole year without ads, for the price of a coffee. Same app, same
                training — just quieter.
              </AppText>
              <AppButton
                title={`Go Ad-Free — ${adFreePrice ?? '$9.99'}/year`}
                icon="sparkles-outline"
                disabled={purchaseBusy || !PurchaseService.isAvailable()}
                onPress={buyAdFree}
              />
              <AppButton
                title="Restore purchase"
                variant="ghost"
                disabled={purchaseBusy}
                onPress={restoreAdFree}
              />
              {purchaseNote && (
                <AppText variant="caption" color={colors.textSoft} center>
                  {purchaseNote}
                </AppText>
              )}
              <AppText variant="caption" color={colors.textMuted}>
                Yearly subscription, auto-renews until cancelled in your store account
                settings.
              </AppText>
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
              hitSlop={8}
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
            >
              <AppText variant="caption" color={colors.primary}>
                Privacy Policy
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Terms of Use"
              hitSlop={8}
              onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_USE_URL).catch(() => {})}
            >
              <AppText variant="caption" color={colors.primary}>
                Terms of Use (EULA)
              </AppText>
            </Pressable>
          </View>
        </AppCard>
        </Reveal>

        <Reveal index={8}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="bold">
            Data
          </AppText>
          {confirmingReset ? (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="body" color={colors.textSoft}>
                This permanently clears your progress, levels, and milestones. There is no undo.
              </AppText>
              <AppButton
                title="Yes, reset everything"
                variant="danger"
                onPress={() => {
                  resetAllProgress();
                  setConfirmingReset(false);
                }}
              />
              <AppButton title="Keep my progress" variant="ghost" onPress={() => setConfirmingReset(false)} />
            </View>
          ) : (
            <AppButton title="Reset progress" variant="ghost" onPress={() => setConfirmingReset(true)} />
          )}
        </AppCard>
        </Reveal>

        <Reveal index={9}>
        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="bold">
            About Braintino
          </AppText>
          <AppText variant="body" color={colors.textSoft}>
            Braintino — Daily Cognitive Practice. Short, structured exercises for attention, memory,
            processing speed, and cognitive control. Five minutes a day, adapted to your level.
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            Braintino is a cognitive practice app for entertainment and personal development. It is
            not a medical device and does not diagnose, treat, cure, or prevent any disease. If you
            are concerned about memory, attention, mood, or daily functioning, speak with a
            qualified healthcare professional.
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Version 1.1.0
          </AppText>
        </AppCard>
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
