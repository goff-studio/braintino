import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { tapHaptic } from '@/services/haptics/haptics';
import { AppText } from './AppText';

type Props = {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  accessibilityHint?: string;
};

/** Large selectable row used by onboarding (single- and multi-select). */
export function SelectableRow({
  label,
  description,
  icon,
  selected,
  onPress,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}: ${description}`}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radius.card,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.chipBlue : colors.card,
        padding: spacing.lg,
        minHeight: 76,
      }}
    >
      <Ionicons name={icon} size={26} color={selected ? colors.primary : colors.textSoft} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyLarge" weight="bold">
          {label}
        </AppText>
        <AppText variant="caption" color={colors.textSoft}>
          {description}
        </AppText>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
    </Pressable>
  );
}
