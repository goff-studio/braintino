import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, tapTarget } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AppText } from './AppText';

type Props = {
  title: string;
  round: number;
  totalRounds: number;
  score?: string;
  onPause: () => void;
  /** Light text for dark game backgrounds. */
  onDark?: boolean;
};

export function GameHeader({ title, round, totalRounds, score, onPause, onDark }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const textColor = onDark ? colors.textOnDark : colors.text;
  const softColor = onDark ? colors.textOnDarkSoft : colors.textSoft;

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.pause')}
        onPress={() => {
          tapHaptic();
          onPause();
        }}
        style={{
          width: tapTarget.min,
          height: tapTarget.min,
          borderRadius: tapTarget.min / 2,
          backgroundColor: onDark ? 'rgba(255,255,255,0.16)' : colors.trackFaint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="pause" size={22} color={textColor} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <AppText variant="gameLabel" weight="bold" color={textColor}>
          {title}
        </AppText>
        {totalRounds > 10 ? (
          <View style={{ marginTop: 6, gap: 4 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: onDark ? 'rgba(255,255,255,0.25)' : colors.trackFaint,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${(Math.min(round, totalRounds) / totalRounds) * 100}%`,
                  height: '100%',
                  backgroundColor: colors.accent,
                  borderWidth: onDark ? 0 : 1,
                  borderColor: 'rgba(11,31,53,0.25)',
                }}
              />
            </View>
            <AppText variant="caption" color={softColor}>
              {Math.min(round, totalRounds)}/{totalRounds}
            </AppText>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 4, alignItems: 'center' }}>
            {Array.from({ length: totalRounds }, (_, i) => (
              <View
                key={i}
                style={{
                  width: i < round ? 18 : 10,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i < round ? colors.accent : onDark ? 'rgba(255,255,255,0.25)' : colors.trackFaint,
                  // Lime needs a hairline outline to hold up on light surfaces.
                  borderWidth: i < round && !onDark ? 1 : 0,
                  borderColor: 'rgba(11,31,53,0.25)',
                }}
              />
            ))}
            <AppText variant="caption" color={softColor} style={{ marginLeft: spacing.xs }}>
              {Math.min(round, totalRounds)}/{totalRounds}
            </AppText>
          </View>
        )}
      </View>
      {score !== undefined && (
        <AppText variant="gameLabel" weight="extraBold" color={textColor}>
          {score}
        </AppText>
      )}
    </View>
  );
}
