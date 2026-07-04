export const fonts = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const fontSizes = {
  caption: 13,
  body: 16,
  bodyLarge: 18,
  button: 18,
  gameLabel: 20,
  title: 24,
  heading: 30,
  display: 40,
  resultNumber: 48,
} as const;

/** Scale a font size when the "bigger text" accessibility setting is on. */
export function scaledSize(size: number, biggerText: boolean): number {
  return biggerText ? Math.round(size * 1.18) : size;
}
