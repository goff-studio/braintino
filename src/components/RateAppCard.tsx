import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import {
  trackRatingAskAccepted,
  trackRatingAskDismissed,
  trackRatingAskShown,
} from '@/services/analytics/ratingEvents';
import {
  dismissRatingAsk,
  requestStoreRating,
  shouldAskForRating,
  type RatingAskEligible,
} from '@/services/review/review';
import { useGameStore } from '@/store/useGameStore';

/**
 * Friendly one-time rating ask on the results screen (see
 * src/services/review/eligibility.ts for the when-and-why). Renders nothing
 * until eligibility is confirmed, so ineligible players never see a flicker.
 */
export function RateAppCard() {
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const session = useGameStore((s) => s.session);
  const lastAssessment = useGameStore((s) => s.lastAssessment);
  const [decision, setDecision] = useState<RatingAskEligible | null>(null);

  useEffect(() => {
    let cancelled = false;
    shouldAskForRating({ progress, session, lastAssessment }).then((gate) => {
      if (cancelled || !gate.ask) return;
      setDecision(gate);
      trackRatingAskShown(gate);
    });
    return () => {
      cancelled = true;
    };
    // Eligibility is decided once per results screen; progress can't gain a
    // second daily-completion day while this screen is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!decision) return null;

  const rate = () => {
    setDecision(null);
    trackRatingAskAccepted(decision);
    requestStoreRating();
  };

  const later = () => {
    setDecision(null);
    trackRatingAskDismissed(decision);
    dismissRatingAsk();
  };

  return (
    <AppCard style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
        }}
      >
        <Ionicons name="heart" size={20} color={colors.primary} />
        <AppText variant="bodyLarge" weight="bold">
          Enjoying Braintino?
        </AppText>
      </View>
      <AppText variant="body" color={colors.textSoft} center>
        {askBody(decision)}
      </AppText>
      <AppButton title="Sure, I’ll rate it" icon="star-outline" onPress={rate} />
      <AppButton title="Maybe later" variant="ghost" onPress={later} />
    </AppCard>
  );
}

function askBody(decision: RatingAskEligible): string {
  if (decision.reason === 'strong_session_1') {
    return 'Nice first session. If Braintino felt good to you, a quick rating helps other curious minds find it.';
  }
  if (decision.reason === 'early_streak') {
    return `A ${decision.streak}-day streak — that’s how sharper habits start. If Braintino is working for you, a quick rating helps other curious minds find it.`;
  }
  return 'If Braintino is working for you, a quick rating helps other curious minds find it.';
}
