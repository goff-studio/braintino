import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { localizedAssessmentBand } from '@/i18n/copy';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

export default function AssessmentIntroScreen() {
  const { t } = useTranslation();
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
            {t('assessment.brandCaps')}
          </AppText>
          <AppText variant="heading" center>
            {t('assessment.name')}
          </AppText>
          <AppText variant="body" color={colors.textSoft} center>
            {t('assessment.intro', { duration: gameConfig.assessment.durationLabel })}
          </AppText>
        </Reveal>

        <Reveal index={1}>
          <AppCard style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <AppText variant="bodyLarge" weight="bold">
                {t('assessment.howTitle')}
              </AppText>
            </View>
            <AppText variant="body" color={colors.textSoft}>
              {t('assessment.howBody')}
            </AppText>
            {lastAssessment && (
              <AppText variant="caption" color={colors.textMuted}>
                {t('assessment.lastSnapshot', {
                  score: lastAssessment.score,
                  band: localizedAssessmentBand(lastAssessment.score, t).label,
                })}
              </AppText>
            )}
          </AppCard>
        </Reveal>

        <Reveal index={2}>
          <AssessmentDisclaimer />
        </Reveal>

        <Reveal index={3} style={{ gap: spacing.md }}>
          <AppButton
            title={lastAssessment ? t('assessment.retake') : t('assessment.start')}
            icon="play"
            onPress={() => {
              router.push({ pathname: '/assessment/play', params: { source } });
            }}
          />
          <AppButton title={t('common.notNow')} variant="ghost" onPress={leave} />
        </Reveal>
      </ScrollView>
    </ScreenBackground>
  );
}
