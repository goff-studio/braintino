import React from 'react';
import { Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, tapTarget } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AppText } from './AppText';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function ToggleRow({ label, description, value, onValueChange, icon }: Props) {
  const { colors, fs } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: tapTarget.min + 8,
        paddingVertical: spacing.sm,
      }}
    >
      {icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: `${colors.primary}14`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={fs(20)} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyLarge" weight="semiBold">
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color={colors.textSoft}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(v) => {
          tapHaptic();
          onValueChange(v);
        }}
        trackColor={{ false: colors.trackFaint, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
