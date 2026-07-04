import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ToggleRow } from '@/components/ToggleRow';
import { TinoMascot } from '@/components/TinoMascot';
import { gradients } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { useGameStore } from '@/store/useGameStore';
import type { PlayStyle } from '@/types/settings';

const STYLES: { id: PlayStyle; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'relaxed', label: 'Relaxed', description: 'Extra time and a calm pace', icon: 'cafe' },
  { id: 'balanced', label: 'Balanced', description: 'A steady, friendly challenge', icon: 'sunny' },
  { id: 'challenge', label: 'Challenge', description: 'A brisker pace for puzzle fans', icon: 'flash' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, reducedMotion } = useTheme();
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const startPracticeSession = useGameStore((s) => s.startPracticeSession);

  const [step, setStep] = useState(0);
  const [style, setStyle] = useState<PlayStyle>('balanced');
  const [biggerText, setBiggerText] = useState(false);
  const [reduceMotionPref, setReduceMotionPref] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const finish = (playFirst: boolean) => {
    completeOnboarding(style, {
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
                backgroundColor: i <= step ? colors.primary : 'rgba(16,42,67,0.15)',
              }}
            />
          ))}
        </View>

        {step === 0 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ gap: spacing.lg }}>
            <View style={{ alignItems: 'center' }}>
              <TinoMascot size={150} mood="cheer" />
            </View>
            <AppText variant="heading" center>
              Meet Braintino
            </AppText>
            <AppText variant="bodyLarge" color={colors.textSoft} center>
              Short daily puzzles for focus, memory, and attention — with Tino, your cozy guide to
              the mind island.
            </AppText>
            <AppButton title="Let’s begin" icon="arrow-forward" onPress={() => setStep(1)} />
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ gap: spacing.lg }}>
            <AppText variant="title" center>
              How do you like to play?
            </AppText>
            <AppText variant="body" color={colors.textSoft} center>
              You can change this anytime in Settings.
            </AppText>
            <View style={{ gap: spacing.md }}>
              {STYLES.map((s) => {
                const active = style === s.id;
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${s.label}: ${s.description}`}
                    onPress={() => {
                      tapHaptic();
                      setStyle(s.id);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      borderRadius: radius.card,
                      borderWidth: 2,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? `${colors.primary}10` : colors.card,
                      padding: spacing.lg,
                      minHeight: 76,
                    }}
                  >
                    <Ionicons name={s.icon} size={26} color={active ? colors.primary : colors.textSoft} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyLarge" weight="extraBold">
                        {s.label}
                      </AppText>
                      <AppText variant="caption" color={colors.textSoft}>
                        {s.description}
                      </AppText>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </View>
            <AppButton title="Continue" icon="arrow-forward" onPress={() => setStep(2)} />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ gap: spacing.lg }}>
            <AppText variant="title" center>
              Make it comfortable
            </AppText>
            <AppCard style={{ gap: spacing.xs }}>
              <ToggleRow
                label="Bigger text"
                description="Larger, easier-to-read labels"
                icon="text"
                value={biggerText}
                onValueChange={setBiggerText}
              />
              <ToggleRow
                label="Reduced motion"
                description="Calmer, minimal animations"
                icon="pause-circle"
                value={reduceMotionPref}
                onValueChange={setReduceMotionPref}
              />
              <ToggleRow
                label="High contrast"
                description="Stronger colors and outlines"
                icon="contrast"
                value={highContrast}
                onValueChange={setHighContrast}
              />
            </AppCard>
            <AppButton title="Continue" icon="arrow-forward" onPress={() => setStep(3)} />
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400)} style={{ gap: spacing.lg }}>
            <View style={{ alignItems: 'center' }}>
              <TinoMascot size={130} mood="happy" />
            </View>
            <AppCard style={{ gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.xl }}>
              <AppText variant="title" center>
                “Hi, I’m Tino.”
              </AppText>
              <AppText variant="bodyLarge" color={colors.textSoft} center>
                “Let’s warm up your focus with a tiny puzzle at the lighthouse. Something will flash —
                just tell me what you saw.”
              </AppText>
              <AppText variant="bodyLarge" color={colors.textSoft} center>
                “No rush. Accuracy matters most. Ready?”
              </AppText>
            </AppCard>
            <AppButton title="Start First Puzzle" icon="flash" onPress={() => finish(true)} />
            <AppButton title="Explore the app first" variant="ghost" onPress={() => finish(false)} />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}
