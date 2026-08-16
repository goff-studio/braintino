import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { trackEvent } from '@/services/analytics/analytics';
import { dismissRatingAsk, requestStoreRating, shouldAskForRating } from '@/services/review/review';
import { useGameStore } from '@/store/useGameStore';

/**
 * Friendly one-time rating ask on the results screen (see
 * src/services/review/review.ts for the when-and-why). Renders nothing until
 * eligibility is confirmed, so ineligible players never see a flicker.
 */
export function RateAppCard() {
  const { colors } = useTheme();
  const progress = useGameStore((s) => s.progress);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    shouldAskForRating(progress).then((eligible) => {
      if (cancelled || !eligible) return;
      setVisible(true);
      trackEvent('rating_ask_shown');
    });
    return () => {
      cancelled = true;
    };
    // Eligibility is decided once per results screen; progress can't gain a
    // second daily-completion day while this screen is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const rate = () => {
    setVisible(false);
    trackEvent('rating_ask_accepted');
    requestStoreRating();
  };

  const later = () => {
    setVisible(false);
    trackEvent('rating_ask_dismissed');
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
        Two days of training — that’s how sharper habits start. If Braintino is
        working for you, a quick rating helps other curious minds find it.
      </AppText>
      <AppButton title="Sure, I’ll rate it" icon="star-outline" onPress={rate} />
      <AppButton title="Maybe later" variant="ghost" onPress={later} />
    </AppCard>
  );
}
