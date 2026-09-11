import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { palette } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { clamp } from '@/utils/math';

type Props = {
  label: string;
  value: number;
  /** Locked brand colors for the share image (ignores theme). */
  branded?: boolean;
};

/** Focus / Speed / Consistency row from the approved Figma frames. */
export function AssessmentSkillBar({ label, value, branded }: Props) {
  const { colors } = useTheme();
  const track = branded ? 'rgba(11,31,53,0.08)' : colors.trackFaint;
  const fill = branded ? palette.brandBlue : colors.primary;
  const labelColor = branded ? palette.deepNavy : colors.text;
  const valueColor = branded ? palette.brandBlue : colors.primary;

  return (
    <View style={{ gap: 8, width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="caption" weight="semiBold" color={labelColor} style={{ fontSize: 14 }}>
          {label}
        </AppText>
        <AppText variant="caption" weight="semiBold" color={valueColor} style={{ fontSize: 14 }}>
          {value}
        </AppText>
      </View>
      <View
        style={{
          height: 10,
          borderRadius: 999,
          backgroundColor: track,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            width: `${clamp(value, 0, 100)}%`,
            height: 10,
            borderRadius: 999,
            backgroundColor: fill,
          }}
        />
      </View>
    </View>
  );
}
