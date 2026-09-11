import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AssessmentDisclaimer } from '@/components/AssessmentDisclaimer';
import { AssessmentShareCard } from '@/components/AssessmentShareCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { trackResultShared } from '@/services/analytics/assessmentEvents';
import { shareAssessmentCard } from '@/services/share/shareCard';
import { useGameStore } from '@/store/useGameStore';

/**
 * Minimal result UI. Final layout / visual polish is held for a Figma pass.
 * The share button captures the placeholder card so a designed image can
 * drop in later without changing field names (see docs/assessment-result-card.md).
 */
export default function AssessmentResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const result = useGameStore((s) => s.lastAssessment);
  const onboardingDone = useGameStore((s) => s.settings.onboardingDone);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  if (!result) {
    return (
      <ScreenBackground gradient={gradients.results}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg }}>
          <AppText variant="title" center>
            No snapshot yet
          </AppText>
          <AppButton title="Take Focus Snapshot" onPress={() => router.replace('/assessment')} />
        </View>
      </ScreenBackground>
    );
  }

  const leave = () => {
    router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
  };

  const onShare = async () => {
    if (sharing || !cardRef.current) return;
    setSharing(true);
    try {
      const method = await shareAssessmentCard(cardRef, result);
      trackResultShared(result, method);
    } catch {
      // Share cancel / unavailable — do not invent medical copy.
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScreenBackground gradient={gradients.results}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <AppText variant="title">Focus Snapshot result</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Placeholder UI — score fields only. Visual design pending Figma.
        </AppText>

        <AppText variant="body">score: {result.score} / 100</AppText>
        <AppText variant="body">focus: {result.focus}</AppText>
        <AppText variant="body">speed: {result.speed}</AppText>
        <AppText variant="body">consistency: {result.consistency}</AppText>
        <AppText variant="body">band_label: {result.band.label}</AppText>
        <AppText variant="body" color={colors.textSoft}>
          band_blurb: {result.band.blurb}
        </AppText>

        <View ref={cardRef} collapsable={false}>
          <AssessmentShareCard result={result} />
        </View>

        <AssessmentDisclaimer />

        <AppButton
          title="Share result"
          icon="share-outline"
          disabled={sharing}
          onPress={() => {
            void onShare();
          }}
        />
        <AppButton
          title="Try again"
          variant="secondary"
          onPress={() => {
            router.replace({ pathname: '/assessment/play', params: { source: result.source } });
          }}
        />
        <AppButton title="Done" variant="ghost" onPress={leave} />
      </ScrollView>
    </ScreenBackground>
  );
}
