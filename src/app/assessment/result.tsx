import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { OffscreenAssessmentShareCard } from '@/components/AssessmentShareCard';
import { AssessmentSkillBar } from '@/components/AssessmentSkillBar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { palette } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { RESULT_SCREEN_DISCLAIMER } from '@/game/engines/assessment';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { presentShare } from '@/services/share/shareLoop';
import { useGameStore } from '@/store/useGameStore';

/**
 * iPhone / Result (Figma 1:2). Share captures AssessmentShareCard (1:39),
 * rendered off-screen so the in-app layout stays the result frame.
 */
export default function AssessmentResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fs } = useTheme();
  const result = useGameStore((s) => s.lastAssessment);
  const onboardingDone = useGameStore((s) => s.settings.onboardingDone);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const leave = () => {
    router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
  };

  const onShare = async (kind: 'result' | 'invite') => {
    if (sharing || !result) return;
    if (kind === 'result' && !cardRef.current) return;
    setSharing(true);
    try {
      await presentShare({
        kind,
        surface: 'assessment_result',
        viewRef: cardRef.current,
        result,
      });
    } catch {
      // Share cancel / unavailable — do not invent medical copy.
    } finally {
      setSharing(false);
    }
  };

  if (!result) {
    return (
      <ScreenBackground gradient={[palette.appBg, palette.appBg]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg }}>
          <AppText variant="title" center>
            No snapshot yet
          </AppText>
          <AppButton title="Take Focus Snapshot" onPress={() => router.replace('/assessment')} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground gradient={[palette.appBg, palette.appBg]}>
      <OffscreenAssessmentShareCard result={result} cardRef={cardRef} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 28,
          flexGrow: 1,
        }}
      >
        <View style={{ width: '100%', maxWidth: 390, alignSelf: 'center', gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            onPress={() => {
              tapHaptic();
              leave();
            }}
          >
            <AppText variant="caption" weight="medium" color={colors.primary} style={{ fontSize: 15 }}>
              Close
            </AppText>
          </Pressable>
          <AppText variant="caption" weight="semiBold" color={colors.text} style={{ fontSize: 15 }}>
            Focus Snapshot
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share"
            hitSlop={12}
            disabled={sharing}
            onPress={() => {
              tapHaptic();
              void onShare('result');
            }}
          >
            <AppText variant="caption" weight="semiBold" color={colors.primary} style={{ fontSize: 15 }}>
              Share
            </AppText>
          </Pressable>
        </View>

        <AppCard
          style={{
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 24,
            paddingVertical: 28,
            borderRadius: radius.card,
            shadowOpacity: 0,
            elevation: 0,
          }}
        >
          <View
            style={{
              backgroundColor: colors.chipBlue,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <AppText variant="caption" weight="semiBold" color={colors.primary} style={{ fontSize: 12 }}>
              Braintino
            </AppText>
          </View>
          <AppText variant="caption" weight="medium" color={colors.textMuted} style={{ fontSize: 13 }}>
            Focus Snapshot
          </AppText>
          <AppText
            variant="resultNumber"
            weight="bold"
            style={{ fontSize: fs(64), lineHeight: fs(72) }}
            accessibilityLabel={`Score ${result.score} out of 100`}
          >
            {result.score}
          </AppText>
          <AppText variant="caption" weight="medium" color={colors.textMuted} style={{ fontSize: 14 }}>
            out of 100
          </AppText>
          <View style={{ alignItems: 'center', gap: 4, paddingTop: 8 }}>
            <AppText variant="gameLabel" weight="semiBold" center>
              {result.band.label}
            </AppText>
            <AppText variant="caption" color={colors.textSoft} style={{ fontSize: 14 }} center>
              {result.band.blurb}
            </AppText>
          </View>
        </AppCard>

        <AppCard
          style={{
            gap: 18,
            padding: 20,
            borderRadius: 20,
            shadowOpacity: 0,
            elevation: 0,
          }}
        >
          <AppText variant="caption" weight="semiBold" style={{ fontSize: 15 }}>
            Breakdown
          </AppText>
          <AssessmentSkillBar label="Focus" value={result.focus} />
          <AssessmentSkillBar label="Speed" value={result.speed} />
          <AssessmentSkillBar label="Consistency" value={result.consistency} />
        </AppCard>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share your snapshot"
          disabled={sharing}
          onPress={() => {
            tapHaptic();
            void onShare('result');
          }}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: sharing ? 0.45 : 1,
          }}
        >
          <AppText variant="button" weight="semiBold" color={colors.textOnDark} style={{ fontSize: 16 }}>
            Share your snapshot
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Challenge a friend"
          disabled={sharing}
          onPress={() => {
            tapHaptic();
            void onShare('invite');
          }}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: sharing ? 0.45 : 1,
          }}
        >
          <AppText variant="button" weight="semiBold" color={colors.primary} style={{ fontSize: 16 }}>
            Challenge a friend
          </AppText>
        </Pressable>

        <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11 }} center>
          {RESULT_SCREEN_DISCLAIMER}
        </AppText>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
