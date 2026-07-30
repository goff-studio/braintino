import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppCard } from './AppCard';
import { AppText } from './AppText';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ icon, label, value, color, style }: Props) {
  const { colors, fs } = useTheme();
  const tint = color ?? colors.primary;
  return (
    <AppCard style={[{ gap: spacing.sm }, style]}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: colors.chipBlue,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={fs(20)} color={tint} />
      </View>
      <View>
        <AppText variant="title" weight="bold">
          {value}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
      </View>
    </AppCard>
  );
}
