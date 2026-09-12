import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { OffscreenAssessmentShareCard } from '@/components/AssessmentShareCard';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { presentShare, type ShareSurface } from '@/services/share/shareLoop';
import type { AssessmentResult } from '@/types/assessment';

type Props = {
  surface: ShareSurface;
  /** 7 / 14 / 30 when this card is a streak milestone share. */
  streakDays?: number;
  result?: AssessmentResult | null;
};

/**
 * Friend-challenge / streak-share prompt. Reuses the Focus Snapshot card
 * when a result is available; invite always sends prefilled text + store URLs.
 */
export function FriendChallengeCard({ surface, streakDays, result }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const run = async (kind: 'invite' | 'streak') => {
    if (busy) return;
    setBusy(true);
    try {
      await presentShare({
        kind,
        surface,
        viewRef: cardRef.current,
        result,
        streakDays,
      });
    } finally {
      setBusy(false);
    }
  };

  const title = streakDays ? t('invite.streakTitle', { count: streakDays }) : t('invite.challengeTitle');
  const body = streakDays ? t('invite.streakBody') : t('invite.challengeBody');

  return (
    <>
      {result ? <OffscreenAssessmentShareCard result={result} cardRef={cardRef} /> : null}
      <AppCard style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <AppText variant="bodyLarge" weight="bold">
            {title}
          </AppText>
        </View>
        <AppText variant="body" color={colors.textSoft}>
          {body}
        </AppText>
        {streakDays ? (
          <AppButton
            title={t('invite.shareStreak')}
            icon="share-outline"
            disabled={busy}
            onPress={() => {
              void run('streak');
            }}
          />
        ) : null}
        <AppButton
          title={t('invite.challengeTitle')}
          icon="flash-outline"
          variant={streakDays ? 'secondary' : 'primary'}
          disabled={busy}
          onPress={() => {
            void run('invite');
          }}
        />
      </AppCard>
    </>
  );
}
