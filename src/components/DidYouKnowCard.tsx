import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { spacing } from '@/constants/spacing';
import type { ScienceFact } from '@/data/facts';
import { useTheme } from '@/hooks/useTheme';
import { AppCard } from './AppCard';
import { AppText } from './AppText';

/** Same cinematic ease-out as the shared motion language in constants/motion. */
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * The fact of the day, as the headline moment of the results screen: a navy
 * hero card that rises into place, pops its badge, then takes a single slow
 * light sweep. It leads the screen alone for a beat (see FACT_HOLD_MS in
 * app/results.tsx) so the fact is read rather than scrolled past.
 */
export function DidYouKnowCard({ fact }: { fact: ScienceFact }) {
  const { t } = useTranslation();
  const { colors, fs, reducedMotion } = useTheme();
  const [cardWidth, setCardWidth] = useState(0);

  const enter = useSharedValue(reducedMotion ? 1 : 0);
  const badge = useSharedValue(reducedMotion ? 1 : 0);
  const body = useSharedValue(reducedMotion ? 1 : 0);
  const sheen = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    enter.value = withDelay(120, withTiming(1, { duration: 520, easing: EASE }));
    badge.value = withDelay(340, withSpring(1, { damping: 11, stiffness: 220 }));
    body.value = withDelay(420, withTiming(1, { duration: 460, easing: EASE }));
  }, [enter, badge, body, reducedMotion]);

  // The sweep needs a measured width, so it starts once onLayout has landed.
  useEffect(() => {
    if (reducedMotion || cardWidth === 0) return;
    sheen.value = withDelay(
      640,
      withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.quad) })
    );
  }, [cardWidth, reducedMotion, sheen]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: interpolate(enter.value, [0, 1], [26, 0]) },
      { scale: interpolate(enter.value, [0, 1], [0.94, 1]) },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.value,
    transform: [
      { scale: interpolate(badge.value, [0, 1], [0.4, 1]) },
      { rotate: `${interpolate(badge.value, [0, 1], [-22, 0])}deg` },
    ],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: body.value,
    transform: [{ translateY: interpolate(body.value, [0, 1], [10, 0]) }],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sheen.value, [0, 0.12, 0.8, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: interpolate(sheen.value, [0, 1], [-cardWidth * 0.4, cardWidth * 1.3]) },
      { skewX: '-16deg' },
    ],
  }));

  return (
    <Animated.View
      style={cardStyle}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      <AppCard hero style={{ gap: spacing.lg }}>
        {!reducedMotion && cardWidth > 0 && (
          <Animated.View
            style={[
              {
                pointerEvents: 'none',
                position: 'absolute',
                top: -80,
                bottom: -80,
                left: -spacing.xl,
                width: cardWidth * 0.3,
              },
              sheenStyle,
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Animated.View
            style={[
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.12)',
              },
              badgeStyle,
            ]}
          >
            <Ionicons name="bulb" size={22} color={colors.accent} />
          </Animated.View>
          <AppText
            variant="caption"
            weight="bold"
            color={colors.textOnDark}
            style={{ letterSpacing: 1.6 }}
          >
            {t('results.didYouKnow')}
          </AppText>
        </View>

        <Animated.View style={[{ gap: spacing.lg }, bodyStyle]}>
          <AppText
            variant="bodyLarge"
            weight="semiBold"
            color={colors.textOnDark}
            style={{ lineHeight: fs(26) }}
          >
            {fact.fact}
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t('results.readSource', { source: fact.source })}
            onPress={() => WebBrowser.openBrowserAsync(fact.link).catch(() => {})}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
          >
            <Ionicons name="open-outline" size={14} color={colors.textOnDarkSoft} />
            <AppText
              variant="caption"
              color={colors.textOnDarkSoft}
              numberOfLines={2}
              style={{ flex: 1 }}
            >
              {fact.source}
            </AppText>
          </Pressable>
        </Animated.View>
      </AppCard>
    </Animated.View>
  );
}
