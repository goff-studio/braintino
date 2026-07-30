import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/services/audio/audio';
import { AdService } from '@/services/monetization/AdService';
import { REWARDED_BONUS_XP } from '@/services/monetization/admob';
import { useGameStore } from '@/store/useGameStore';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { AppText } from './AppText';

type Phase = 'idle' | 'showing' | 'earned' | 'unavailable';

/**
 * Opt-in rewarded ad placement: a small card on the results screen after the
 * daily session, offering bonus XP. Entirely optional — daily practice and
 * feedback are never gated behind it, per the monetization rules in
 * src/services/monetization/README.md.
 */
export function RewardedBonusCard() {
  const { colors } = useTheme();
  const grantBonusXp = useGameStore((s) => s.grantBonusXp);
  const [ready, setReady] = useState(AdService.isRewardedReady());
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => AdService.onRewardedReady(setReady), []);

  const watch = async () => {
    setPhase('showing');
    const result = await AdService.showRewarded();
    if (result === 'earned') {
      grantBonusXp(REWARDED_BONUS_XP);
      playSound('complete');
      setPhase('earned');
    } else {
      setPhase(result === 'unavailable' ? 'unavailable' : 'idle');
    }
  };

  if (phase === 'earned') {
    return (
      <AppCard style={{ alignItems: 'center', gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Ionicons name="flash-outline" size={20} color={colors.success} />
          <AppText variant="bodyLarge" weight="bold">
            +{REWARDED_BONUS_XP} XP added
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textSoft} center>
          Thanks for the support — ads keep Braintino free.
        </AppText>
      </AppCard>
    );
  }

  return (
    <AppCard style={{ gap: spacing.sm }}>
      <AppText variant="bodyLarge" weight="bold">
        Bonus XP
      </AppText>
      <AppText variant="caption" color={colors.textSoft}>
        Watch a short ad to add +{REWARDED_BONUS_XP} XP to today’s session. Optional — ads keep
        Braintino free.
      </AppText>
      {phase === 'unavailable' && (
        <AppText variant="caption" color={colors.textSoft}>
          No ad is ready right now — please try again in a moment.
        </AppText>
      )}
      <AppButton
        title={phase === 'showing' ? 'Loading…' : `Watch ad for +${REWARDED_BONUS_XP} XP`}
        icon="play-circle-outline"
        variant="secondary"
        disabled={!ready || phase === 'showing'}
        onPress={watch}
      />
    </AppCard>
  );
}
