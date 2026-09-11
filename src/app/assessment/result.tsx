import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AssessmentDisclaimer } from '@/components/AssessmentDisclaimer';
import { AssessmentShareCard } from '@/components/AssessmentShareCard';
import { Reveal } from '@/components/Reveal';
import { ScreenBackground } from '@/components/ScreenBackground';
import { gradients } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { trackResultShared } from '@/services/analytics/assessmentEvents';
import { completionHaptic } from '@/services/haptics/haptics';
import { shareAssessmentCard } from '@/services/share/shareCard';
import { useGameStore } from '@/store/useGameStore';

export default function AssessmentResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const result = useGameStore((s) => s.lastAssessment);
  const onboardingDone = useGameStore((s) => s.settings.onboardingDone);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!result) return;
    playSound('complete');
    completionHaptic();
  }, [result]);

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
      // Share cancel / unavailable — don't toast medical copy or block the screen.
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
          gap: spacing.lg,
        }}
      >
        <Reveal index={0} style={{ alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="heading" center>
            Your snapshot
          </AppText>
          <AppText variant="body" color={colors.textSoft} center>
            {result.band.blurb}
          </AppText>
        </Reveal>

        <Reveal index={1}>
          <View ref={cardRef} collapsable={false}>
            <AssessmentShareCard result={result} />
          </View>
        </Reveal>

        <Reveal index={2}>
          <AssessmentDisclaimer />
        </Reveal>

        <Reveal index={3} style={{ gap: spacing.md }}>
          <AppButton
            title="Share result"
            icon="share-outline"
            tone="lime"
            disabled={sharing}
            onPress={() => {
              void onShare();
            }}
          />
          <AppButton
            title="Try again"
            icon="refresh"
            variant="secondary"
            onPress={() => {
              router.replace({ pathname: '/assessment/play', params: { source: result.source } });
            }}
          />
          <AppButton title="Done" variant="ghost" onPress={leave} />
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
