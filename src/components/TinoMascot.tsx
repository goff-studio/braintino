import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getCosmetic } from '@/data/cosmetics';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

type Props = {
  size?: number;
  mood?: 'happy' | 'cheer' | 'calm';
  /** Overrides the equipped cosmetics (e.g. on the collection screen). */
  hatId?: string | null;
  scarfId?: string | null;
};

/**
 * Tino — a soft, rounded, friendly little guide. Abstract curves only,
 * nothing anatomical: a glowing blob with two gentle lobes, eyes, and a smile.
 */
export function TinoMascot({ size = 120, mood = 'happy', hatId, scarfId }: Props) {
  const { reducedMotion } = useTheme();
  const selected = useGameStore((s) => s.progress.selectedCosmetics);
  const bounce = useSharedValue(0);

  const hat = getCosmetic(hatId === undefined ? selected.hat : hatId ?? '');
  const scarf = getCosmetic(scarfId === undefined ? selected.scarf : scarfId ?? '');

  useEffect(() => {
    if (reducedMotion) {
      bounce.value = 0;
      return;
    }
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [reducedMotion, bounce]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * -size * 0.04 }],
  }));

  const s = size;
  const eyeSize = s * 0.09;
  const cheer = mood === 'cheer';

  return (
    <View style={{ width: s, height: s * 1.06, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* soft glow */}
      <View
        style={{
          position: 'absolute',
          bottom: s * 0.02,
          width: s * 0.98,
          height: s * 0.98,
          borderRadius: s * 0.49,
          backgroundColor: 'rgba(142,124,255,0.18)',
        }}
      />
      <Animated.View style={[{ width: s * 0.86, height: s * 0.84, alignItems: 'center' }, bodyStyle]}>
        {/* top lobes — abstract soft curves */}
        <View style={{ position: 'absolute', top: 0, flexDirection: 'row', gap: s * 0.02 }}>
          <LinearGradient
            colors={['#B3A6FF', '#8E7CFF']}
            style={{ width: s * 0.4, height: s * 0.4, borderRadius: s * 0.2 }}
          />
          <LinearGradient
            colors={['#B3A6FF', '#8E7CFF']}
            style={{ width: s * 0.4, height: s * 0.4, borderRadius: s * 0.2 }}
          />
        </View>
        {/* body blob */}
        <LinearGradient
          colors={['#A99BFF', '#8E7CFF']}
          style={{
            position: 'absolute',
            top: s * 0.12,
            width: s * 0.86,
            height: s * 0.72,
            borderRadius: s * 0.36,
          }}
        />
        {/* arms */}
        <View
          style={{
            position: 'absolute',
            left: -s * 0.05,
            top: cheer ? s * 0.22 : s * 0.48,
            width: s * 0.2,
            height: s * 0.1,
            borderRadius: s * 0.05,
            backgroundColor: '#8E7CFF',
            transform: [{ rotate: cheer ? '-40deg' : '-12deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -s * 0.05,
            top: cheer ? s * 0.22 : s * 0.48,
            width: s * 0.2,
            height: s * 0.1,
            borderRadius: s * 0.05,
            backgroundColor: '#8E7CFF',
            transform: [{ rotate: cheer ? '40deg' : '12deg' }],
          }}
        />
        {/* face */}
        <View style={{ position: 'absolute', top: s * 0.34, alignItems: 'center', width: '100%' }}>
          <View style={{ flexDirection: 'row', gap: s * 0.16 }}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{
                  width: eyeSize,
                  height: mood === 'calm' ? eyeSize * 0.45 : eyeSize,
                  borderRadius: eyeSize / 2,
                  backgroundColor: '#102A43',
                }}
              >
                {mood !== 'calm' && (
                  <View
                    style={{
                      position: 'absolute',
                      top: eyeSize * 0.15,
                      left: eyeSize * 0.15,
                      width: eyeSize * 0.3,
                      height: eyeSize * 0.3,
                      borderRadius: eyeSize * 0.15,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                )}
              </View>
            ))}
          </View>
          {/* cheeks */}
          <View
            style={{
              flexDirection: 'row',
              gap: s * 0.34,
              position: 'absolute',
              top: eyeSize * 1.1,
            }}
          >
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{
                  width: s * 0.08,
                  height: s * 0.05,
                  borderRadius: s * 0.04,
                  backgroundColor: 'rgba(255,122,89,0.4)',
                }}
              />
            ))}
          </View>
          {/* smile */}
          <View
            style={{
              marginTop: s * 0.045,
              width: cheer ? s * 0.2 : s * 0.14,
              height: cheer ? s * 0.1 : s * 0.07,
              borderBottomLeftRadius: s * 0.1,
              borderBottomRightRadius: s * 0.1,
              borderWidth: s * 0.025,
              borderTopWidth: 0,
              borderColor: '#102A43',
              backgroundColor: cheer ? '#FF9E85' : 'transparent',
            }}
          />
        </View>
        {/* scarf */}
        {scarf && (
          <>
            <View
              style={{
                position: 'absolute',
                bottom: -s * 0.02,
                width: s * 0.6,
                height: s * 0.11,
                borderRadius: s * 0.06,
                backgroundColor: scarf.color,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -s * 0.14,
                right: s * 0.16,
                width: s * 0.11,
                height: s * 0.18,
                borderRadius: s * 0.05,
                backgroundColor: scarf.color,
              }}
            />
          </>
        )}
        {/* hat */}
        {hat?.id === 'hat_explorer' && (
          <View style={{ position: 'absolute', top: -s * 0.1, alignItems: 'center' }}>
            <View
              style={{
                width: s * 0.34,
                height: s * 0.16,
                borderTopLeftRadius: s * 0.17,
                borderTopRightRadius: s * 0.17,
                backgroundColor: '#C58A4B',
              }}
            />
            <View
              style={{
                width: s * 0.52,
                height: s * 0.05,
                borderRadius: s * 0.03,
                backgroundColor: '#A9743C',
              }}
            />
          </View>
        )}
        {hat?.id === 'hat_captain' && (
          <View style={{ position: 'absolute', top: -s * 0.1, alignItems: 'center' }}>
            <View
              style={{
                width: s * 0.36,
                height: s * 0.14,
                borderTopLeftRadius: s * 0.18,
                borderTopRightRadius: s * 0.18,
                backgroundColor: '#2F80ED',
              }}
            />
            <View
              style={{
                width: s * 0.44,
                height: s * 0.05,
                borderRadius: s * 0.03,
                backgroundColor: '#102A43',
              }}
            />
          </View>
        )}
        {hat?.id === 'hat_flower' && (
          <View style={{ position: 'absolute', top: -s * 0.08, left: s * 0.14 }}>
            {[0, 72, 144, 216, 288].map((deg) => (
              <View
                key={deg}
                style={{
                  position: 'absolute',
                  width: s * 0.07,
                  height: s * 0.07,
                  borderRadius: s * 0.035,
                  backgroundColor: '#FFD166',
                  transform: [
                    { rotate: `${deg}deg` },
                    { translateY: -s * 0.045 },
                  ],
                }}
              />
            ))}
            <View
              style={{
                width: s * 0.06,
                height: s * 0.06,
                borderRadius: s * 0.03,
                backgroundColor: '#FF7A59',
              }}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}
