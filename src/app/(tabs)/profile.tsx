import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { PersonalPlanCard } from '@/components/PersonalPlanCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StatPill } from '@/components/StatPill';
import { ToggleRow } from '@/components/ToggleRow';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { APP_LOCALES, type LocalePreference } from '@/i18n';
import { formatClock, localizedRank } from '@/i18n/copy';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AdService } from '@/services/monetization/AdService';
import { PurchaseService } from '@/services/monetization/PurchaseService';
import { useGameStore } from '@/store/useGameStore';
import type { DifficultyMode, ReminderFrequency } from '@/types/settings';

const DIFFICULTY_MODES: DifficultyMode[] = ['relaxed', 'balanced', 'challenging'];

// The purchase flow links to both documents (standard Apple EULA). The
// ad-free product is a one-time non-consumable — Apple rejected the previous
// auto-renewing subscription under Guideline 3.1.2 (ad removal alone isn't
// "ongoing value"), so it must not be reintroduced as a subscription.
const PRIVACY_POLICY_URL =
  'https://glimmer-locket-654.notion.site/Privacy-Policy-for-Braintino-393bc9cb57128085877fe98d8a4295e5';
const TERMS_OF_USE_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const REMINDER_FREQUENCIES: ReminderFrequency[] = ['daily', 'everyOtherDay', 'weekdays'];

const REMINDER_TIMES: { id: 'morning' | 'afternoon' | 'evening'; hour: number; minute: number }[] = [
  { id: 'morning', hour: 9, minute: 0 },
  { id: 'afternoon', hour: 14, minute: 0 },
  { id: 'evening', hour: 19, minute: 0 },
];

const LANGUAGE_OPTIONS: LocalePreference[] = ['system', ...APP_LOCALES];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const personalPlan = useGameStore((s) => s.settings.personalPlan);
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
      setPurchaseNote(t('profile.purchaseFailed'));
    }
    setPurchaseBusy(false);
  };

  const restoreAdFree = async () => {
    if (purchaseBusy) return;
    setPurchaseBusy(true);
    setPurchaseNote(null);
    const restored = await PurchaseService.restorePurchases();
    if (!restored) setPurchaseNote(t('profile.restoreNone'));
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
          <AppText variant="heading">{t('profile.title')}</AppText>
        </Reveal>

        <Reveal index={1}>
        <AppCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <BrandMark size={48} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="bodyLarge" weight="bold">
              {t('profile.levelRank', {
                level: progress.globalLevel,
                rank: localizedRank(progress.globalLevel, t),
              })}
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <StatPill
                icon="flame-outline"
                value={t('common.dayStreak', { count: progress.streak })}
                accessibilityLabel={t('common.dayStreak', { count: progress.streak })}
              />
            </View>
          </View>
        </AppCard>
        </Reveal>

        {personalPlan && (
          <Reveal index={2}>
            <PersonalPlanCard plan={personalPlan} compact />
          </Reveal>
        )}

        <Reveal index={personalPlan ? 3 : 2}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            {t('profile.preferences')}
          </AppText>
          <ToggleRow
            label={t('profile.sounds')}
            description={t('profile.soundsBody')}
            icon="volume-medium-outline"
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
          />
          <ToggleRow
            label={t('profile.haptics')}
            description={t('profile.hapticsBody')}
            icon="phone-portrait-outline"
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
          />
        </AppCard>
        </Reveal>

        <Reveal index={personalPlan ? 4 : 3}>
        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="bold">
            {t('profile.language')}
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            {t('profile.languageBody')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {LANGUAGE_OPTIONS.map((option) => {
              const active = settings.localePreference === option;
              const label =
                option === 'system' ? t('profile.languageSystem') : t(`profile.languages.${option}`);
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={
                    option === 'system'
                      ? `${t('profile.languageSystem')}: ${t('profile.languageSystemBody')}`
                      : label
                  }
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    tapHaptic();
                    updateSettings({ localePreference: option });
                  }}
                  style={{
                    borderRadius: radius.button,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.chipBlue : 'transparent',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    minHeight: 44,
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="body" weight="bold" color={active ? colors.primary : colors.text}>
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </AppCard>
        </Reveal>

        <Reveal index={3}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            {t('profile.reminder')}
          </AppText>
          <ToggleRow
            label={t('profile.reminderToggle')}
            description={t('profile.reminderBody')}
            icon="alarm-outline"
            value={settings.reminderEnabled}
            onValueChange={(v) => {
              setPracticeReminder(v).then((result) => setReminderBlocked(result === 'blocked'));
            }}
          />
          {reminderBlocked && !settings.reminderEnabled && (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="caption" color={colors.textSoft}>
                {t('profile.reminderBlocked')}
              </AppText>
              <AppButton
                title={t('profile.openSettings')}
                variant="ghost"
                onPress={() => Linking.openSettings()}
              />
            </View>
          )}
          {settings.reminderEnabled && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              {REMINDER_FREQUENCIES.map((freq) => {
                const active = settings.reminderFrequency === freq;
                return (
                  <Pressable
                    key={freq}
                    accessibilityRole="button"
                    accessibilityLabel={`${t(`profile.frequencies.${freq}.label`)}: ${t(`profile.frequencies.${freq}.description`)}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      tapHaptic();
                      updateReminderConfig({ frequency: freq });
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
                      {t(`profile.frequencies.${freq}.label`)}
                    </AppText>
                    <AppText variant="caption" color={colors.textSoft} center>
                      {t(`profile.frequencies.${freq}.description`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
          {settings.reminderEnabled && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              {REMINDER_TIMES.map((time) => {
                const clock = formatClock(time.hour, time.minute);
                const active =
                  settings.reminderHour === time.hour && settings.reminderMinute === time.minute;
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
                      {t(`profile.times.${time.id}`)}
                    </AppText>
                    <AppText variant="caption" color={colors.textSoft} center>
                      {clock}
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
            {t('profile.difficulty')}
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {DIFFICULTY_MODES.map((mode) => {
              const active = settings.difficultyMode === mode;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(`profile.modes.${mode}.label`)}: ${t(`profile.modes.${mode}.description`)}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    tapHaptic();
                    updateSettings({ difficultyMode: mode });
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
                    {t(`profile.modes.${mode}.label`)}
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft} center>
                    {t(`profile.modes.${mode}.description`)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" color={colors.textMuted}>
            {t('profile.difficultyHint')}
          </AppText>
        </AppCard>
        </Reveal>

        <Reveal index={5}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            {t('profile.accessibility')}
          </AppText>
          <ToggleRow
            label={t('profile.biggerText')}
            description={t('profile.biggerTextBody')}
            icon="text-outline"
            value={settings.biggerText}
            onValueChange={(v) => updateSettings({ biggerText: v })}
          />
          <ToggleRow
            label={t('profile.reducedMotion')}
            description={t('profile.reducedMotionBody')}
            icon="pause-circle-outline"
            value={settings.reducedMotion}
            onValueChange={(v) => updateSettings({ reducedMotion: v })}
          />
          <ToggleRow
            label={t('profile.highContrast')}
            description={t('profile.highContrastBody')}
            icon="contrast-outline"
            value={settings.highContrast}
            onValueChange={(v) => updateSettings({ highContrast: v })}
          />
        </AppCard>
        </Reveal>

        <Reveal index={6}>
        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="bold" style={{ marginBottom: spacing.xs }}>
            {t('profile.privacy')}
          </AppText>
          <ToggleRow
            label={t('profile.analytics')}
            description={t('profile.analyticsBody')}
            icon="shield-checkmark-outline"
            value={settings.analyticsEnabled}
            onValueChange={(v) => updateSettings({ analyticsEnabled: v })}
          />
          {AdService.isPrivacyOptionsRequired() && (
            <AppButton
              title={t('profile.manageAds')}
              variant="ghost"
              onPress={() => AdService.showPrivacyOptions()}
            />
          )}
          <AppText variant="caption" color={colors.textMuted}>
            {t('profile.adsKeepFree')}
          </AppText>
        </AppCard>
        </Reveal>

        <Reveal index={7}>
        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="bold">
            {t('profile.adFree')}
          </AppText>
          {adFree ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <AppText variant="body" color={colors.textSoft} style={{ flex: 1 }}>
                {t('profile.adFreeThanks')}
              </AppText>
            </View>
          ) : (
            <>
              <AppText variant="body" color={colors.textSoft}>
                {t('profile.adFreeBody')}
              </AppText>
              <AppButton
                title={t('profile.goAdFree', { price: adFreePrice ?? '$9.99' })}
                icon="sparkles-outline"
                disabled={purchaseBusy || !PurchaseService.isAvailable()}
                onPress={buyAdFree}
              />
              <AppButton
                title={t('profile.restore')}
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
                {t('profile.oneTime')}
              </AppText>
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('profile.privacyPolicy')}
              hitSlop={8}
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})}
            >
              <AppText variant="caption" color={colors.primary}>
                {t('profile.privacyPolicy')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('profile.terms')}
              hitSlop={8}
              onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_USE_URL).catch(() => {})}
            >
              <AppText variant="caption" color={colors.primary}>
                {t('profile.terms')}
              </AppText>
            </Pressable>
          </View>
        </AppCard>
        </Reveal>

        <Reveal index={8}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="bold">
            {t('profile.data')}
          </AppText>
          {confirmingReset ? (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="body" color={colors.textSoft}>
                {t('profile.resetWarn')}
              </AppText>
              <AppButton
                title={t('profile.resetConfirm')}
                variant="danger"
                onPress={() => {
                  resetAllProgress();
                  setConfirmingReset(false);
                }}
              />
              <AppButton title={t('profile.resetKeep')} variant="ghost" onPress={() => setConfirmingReset(false)} />
            </View>
          ) : (
            <AppButton title={t('profile.reset')} variant="ghost" onPress={() => setConfirmingReset(true)} />
          )}
        </AppCard>
        </Reveal>

        <Reveal index={9}>
        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="bold">
            {t('profile.about')}
          </AppText>
          <AppText variant="body" color={colors.textSoft}>
            {t('profile.aboutBody')}
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            {t('profile.aboutDisclaimer')}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {t('profile.version', { version: '1.5.0' })}
          </AppText>
        </AppCard>
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
