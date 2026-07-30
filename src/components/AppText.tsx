import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { fonts, fontSizes, letterSpacings } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Variant = keyof typeof fontSizes;

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  weight?: keyof typeof fonts;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityLabel?: string;
};

const defaultWeight: Record<Variant, keyof typeof fonts> = {
  caption: 'medium',
  body: 'regular',
  bodyLarge: 'medium',
  button: 'semiBold',
  gameLabel: 'bold',
  title: 'bold',
  heading: 'extraBold',
  display: 'extraBold',
  resultNumber: 'extraBold',
};

export function AppText({
  children,
  variant = 'body',
  weight,
  color,
  center,
  style,
  numberOfLines,
  accessibilityLabel,
}: Props) {
  const { colors, fs } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontFamily: fonts[weight ?? defaultWeight[variant]],
          fontSize: fs(fontSizes[variant]),
          letterSpacing: letterSpacings[variant],
          color: color ?? colors.text,
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
