import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { AssessmentDisclaimer } from '@/components/AssessmentDisclaimer';
import { BrandMark } from '@/components/BrandMark';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { gameConfig } from '@/constants/gameConfig';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { parseAssessmentSource } from '@/game/engines/assessment';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

export default function AssessmentIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ source?: string }>();
  const source = parseAssessmentSource(params.source);
  const lastAssessment = useGameStore((s) => s.lastAssessment);
  const onboardingDone = useGameStore((s) => s.settings.onboardingDone);

  const leave = () => {
    router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
  };

  return (
    <ScreenBackground gradient={gradients.results}>
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
        <Reveal index={0} style={{ alignItems: 'center', gap: spacing.sm }}>
          <BrandMark size={72} />
          <AppText variant="caption" weight="semiBold" color={colors.textMuted} style={{ letterSpacing: 1.2 }}>
            BRAINTINO
          </AppText>
          <AppText variant="heading" center>
            Focus Snapshot
          </AppText>
          <AppText variant="body" color={colors.textSoft} center>
            One short attention check — {gameConfig.assessment.durationLabel}. See a playful
            score for focus, speed, and consistency.
          </AppText>
        </Reveal>

        <Reveal index={1}>
          <AppCard style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <AppText variant="bodyLarge" weight="bold">
                How it works
              </AppText>
            </View>
            <AppText variant="body" color={colors.textSoft}>
              Brief visual cues flash on a radar. Tap what you saw — accuracy first, then
              pace. Same short Processing Speed exercise used in daily practice.
            </AppText>
            {lastAssessment && (
              <AppText variant="caption" color={colors.textMuted}>
                Last snapshot: {lastAssessment.score}/100 · {lastAssessment.band.label}
              </AppText>
            )}
          </AppCard>
        </Reveal>

        <Reveal index={2}>
          <AssessmentDisclaimer />
        </Reveal>

        <Reveal index={3} style={{ gap: spacing.md }}>
          <AppButton
            title={lastAssessment ? 'Retake Snapshot' : 'Start Snapshot'}
            icon="play"
            onPress={() => {
              router.push({ pathname: '/assessment/play', params: { source } });
            }}
          />
          <AppButton title="Not now" variant="ghost" onPress={leave} />
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
