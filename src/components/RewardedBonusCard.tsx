import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const grantBonusXp = useGameStore((s) => s.grantBonusXp);
  const adFree = useGameStore((s) => s.adFree);
  const [ready, setReady] = useState(AdService.isRewardedReady());
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => AdService.onRewardedReady(setReady), []);

  // Ad-free purchasers see no ad placements at all, including opt-in ones.
  if (adFree) return null;

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
            {t('bonus.earned', { xp: REWARDED_BONUS_XP })}
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textSoft} center>
          {t('bonus.thanks')}
        </AppText>
      </AppCard>
    );
  }

  return (
    <AppCard style={{ gap: spacing.sm }}>
      <AppText variant="bodyLarge" weight="bold">
        {t('bonus.title')}
      </AppText>
      <AppText variant="caption" color={colors.textSoft}>
        {t('bonus.body', { xp: REWARDED_BONUS_XP })}
      </AppText>
      {phase === 'unavailable' && (
        <AppText variant="caption" color={colors.textSoft}>
          {t('bonus.unavailable')}
        </AppText>
      )}
      <AppButton
        title={phase === 'showing' ? t('bonus.loading') : t('bonus.watch', { xp: REWARDED_BONUS_XP })}
        icon="play-circle-outline"
        variant="secondary"
        disabled={!ready || phase === 'showing'}
        onPress={watch}
      />
    </AppCard>
  );
}
