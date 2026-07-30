export const palette = {
  deepNavy: '#0B1F35',
  brandBlue: '#0067B1',
  softBlue: '#F4F8FF',
  appBg: '#F5F7FC',
  cardWhite: '#FFFFFF',
  textSecondary: '#4B5563',
  textMuted: '#7A8492',
  textDisabled: '#A7B0BC',
  lime: '#9AF23D',
  green: '#3E7C17',
  chipBlue: '#EAF2FF',
  chipGreen: '#ECFADF',
  amber: '#F5B942',
  coral: '#E85D4A',
  borderLine: '#E1E7F0',
} as const;

export type ThemeColors = {
  background: string;
  backgroundGradient: readonly [string, string, ...string[]];
  card: string;
  cardSoft: string;
  text: string;
  textSoft: string;
  textMuted: string;
  textDisabled: string;
  textOnDark: string;
  textOnDarkSoft: string;
  primary: string;
  secondary: string;
  /** Performance lime. Fill-only: pair with navy text/border, never use as text color. */
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
  chipBlue: string;
  chipGreen: string;
  overlay: string;
  trackFaint: string;
};

const baseTheme: ThemeColors = {
  background: palette.appBg,
  backgroundGradient: ['#F4F8FF', '#F5F7FC', '#FFFFFF'],
  card: palette.cardWhite,
  cardSoft: palette.softBlue,
  text: palette.deepNavy,
  textSoft: palette.textSecondary,
  textMuted: palette.textMuted,
  textDisabled: palette.textDisabled,
  textOnDark: '#FFFFFF',
  textOnDarkSoft: 'rgba(255,255,255,0.75)',
  primary: palette.brandBlue,
  secondary: palette.deepNavy,
  accent: palette.lime,
  success: palette.green,
  warning: palette.amber,
  error: palette.coral,
  border: palette.borderLine,
  shadow: palette.deepNavy,
  chipBlue: palette.chipBlue,
  chipGreen: palette.chipGreen,
  overlay: 'rgba(11,31,53,0.55)',
  trackFaint: 'rgba(11,31,53,0.08)',
};

const highContrastTheme: ThemeColors = {
  ...baseTheme,
  background: '#FFFFFF',
  backgroundGradient: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
  text: '#081527',
  textSoft: '#374151',
  textMuted: '#4B5563',
  textOnDarkSoft: 'rgba(255,255,255,0.92)',
  primary: '#00538F',
  secondary: '#081527',
  accent: '#4C8F0E',
  success: '#2E5F10',
  error: '#C43F2E',
  border: 'rgba(11,31,53,0.35)',
  trackFaint: 'rgba(11,31,53,0.16)',
};

export function getThemeColors(highContrast: boolean): ThemeColors {
  return highContrast ? highContrastTheme : baseTheme;
}

/** Screen background gradients. Light screens get near-imperceptible tints;
 * only the Processing Speed exercise keeps a dark surface. */
export const gradients = {
  base: ['#F4F8FF', '#F5F7FC', '#FFFFFF'],
  home: ['#F4F8FF', '#F5F7FC', '#FFFFFF'],
  daily: ['#F4F8FF', '#F5F7FC', '#FFFFFF'],
  focus: ['#0B1F35', '#0F2A4A', '#143A66'],
  memory: ['#F2F8EE', '#F5F9F3', '#FFFFFF'],
  color: ['#FDF6EC', '#F8F7F2', '#FFFFFF'],
  results: ['#EAF2FF', '#F5F7FC', '#FFFFFF'],
  progress: ['#F4F8FF', '#F5F7FC', '#FFFFFF'],
  navigation: ['#F0F6FC', '#F4F8FF', '#FFFFFF'],
  /** Premium hero cards only — render 135° via LinearGradient start/end. */
  hero: ['#0067B1', '#0B1F35'],
} as const;
