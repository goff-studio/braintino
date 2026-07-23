import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ToggleRow } from '@/components/ToggleRow';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AdService } from '@/services/monetization/AdService';
import { useGameStore } from '@/store/useGameStore';
import type { PlayStyle } from '@/types/settings';

const PLAY_STYLES: { id: PlayStyle; label: string; description: string }[] = [
  { id: 'relaxed', label: 'Relaxed', description: 'More time, calm pace' },
  { id: 'balanced', label: 'Balanced', description: 'A steady challenge' },
  { id: 'challenge', label: 'Challenge', description: 'A brisker pace' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, settings } = useTheme();
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetAllProgress = useGameStore((s) => s.resetAllProgress);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <ScreenBackground gradient={gradients.home} decorative={false}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <AppText variant="heading">Settings</AppText>

        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="extraBold" style={{ marginBottom: spacing.xs }}>
            Sound & Feel
          </AppText>
          <ToggleRow
            label="Sound"
            description="Gentle chimes and taps"
            icon="volume-medium"
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
          />
          <ToggleRow
            label="Haptics"
            description="Soft vibration feedback"
            icon="phone-portrait"
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
          />
        </AppCard>

        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="extraBold" style={{ marginBottom: spacing.xs }}>
            Comfort & Accessibility
          </AppText>
          <ToggleRow
            label="Relaxed mode"
            description="More time, fewer distractions"
            icon="cafe"
            value={settings.relaxedMode}
            onValueChange={(v) => updateSettings({ relaxedMode: v })}
          />
          <ToggleRow
            label="Bigger text"
            description="Larger, easier-to-read labels"
            icon="text"
            value={settings.biggerText}
            onValueChange={(v) => updateSettings({ biggerText: v })}
          />
          <ToggleRow
            label="Reduced motion"
            description="Calmer, minimal animations"
            icon="pause-circle"
            value={settings.reducedMotion}
            onValueChange={(v) => updateSettings({ reducedMotion: v })}
          />
          <ToggleRow
            label="High contrast"
            description="Stronger colors and outlines"
            icon="contrast"
            value={settings.highContrast}
            onValueChange={(v) => updateSettings({ highContrast: v })}
          />
        </AppCard>

        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="extraBold">
            Play Style
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {PLAY_STYLES.map((style) => {
              const active = settings.playStyle === style.id;
              return (
                <Pressable
                  key={style.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${style.label}: ${style.description}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    tapHaptic();
                    updateSettings({ playStyle: style.id, relaxedMode: style.id === 'relaxed' ? true : settings.relaxedMode });
                  }}
                  style={{
                    flex: 1,
                    borderRadius: radius.button,
                    borderWidth: 2,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? `${colors.primary}12` : 'transparent',
                    padding: spacing.md,
                    alignItems: 'center',
                    gap: 2,
                    minHeight: 72,
                  }}
                >
                  <AppText variant="body" weight="extraBold" color={active ? colors.primary : colors.text}>
                    {style.label}
                  </AppText>
                  <AppText variant="caption" color={colors.textSoft} center>
                    {style.description}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        <AppCard style={{ gap: spacing.xs }}>
          <AppText variant="bodyLarge" weight="extraBold" style={{ marginBottom: spacing.xs }}>
            Privacy
          </AppText>
          <ToggleRow
            label="Analytics & personalized content"
            description="Helps us improve Braintino. Ads stay either way, just less relevant when off."
            icon="shield-checkmark"
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
        </AppCard>

        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="bodyLarge" weight="extraBold">
            Data
          </AppText>
          {confirmingReset ? (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="body" color={colors.textSoft}>
                This clears all progress, stars, coins, and cosmetics. There is no undo.
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

        <AppCard style={{ gap: spacing.sm }}>
          <AppText variant="bodyLarge" weight="extraBold">
            About Braintino
          </AppText>
          <AppText variant="body" color={colors.textSoft}>
            Braintino is a cozy collection of daily brain puzzles. Help Tino restore the mind island
            while you challenge your focus, recall, speed, and attention.
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            Braintino is a puzzle game for entertainment and mental engagement. It is not a medical
            device and does not diagnose, treat, cure, or prevent any disease. If you are concerned
            about memory, thinking, mood, or daily functioning, speak with a qualified healthcare
            professional.
          </AppText>
          <AppText variant="caption" color={colors.textSoft}>
            Version 1.0.0
          </AppText>
        </AppCard>
      </ScrollView>
    </ScreenBackground>
  );
}
