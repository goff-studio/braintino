export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const fontSizes = {
  caption: 13,
  body: 16,
  bodyLarge: 17,
  button: 17,
  gameLabel: 20,
  title: 21,
  heading: 28,
  display: 36,
  resultNumber: 44,
} as const;

/** Inter reads better with slight negative tracking at large sizes. */
export const letterSpacings: Partial<Record<keyof typeof fontSizes, number>> = {
  display: -0.5,
  heading: -0.4,
  title: -0.2,
};

/** Scale a font size when the "bigger text" accessibility setting is on. */
export function scaledSize(size: number, biggerText: boolean): number {
  return biggerText ? Math.round(size * 1.18) : size;
}
