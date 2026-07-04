export const palette = {
  deepNavy: '#102A43',
  brainBlue: '#2F80ED',
  aquaMint: '#35D0BA',
  softPurple: '#8E7CFF',
  sunriseCoral: '#FF7A59',
  warmYellow: '#FFD166',
  softSand: '#F9E7C8',
  mistWhite: '#F7FAFC',
  lavenderFog: '#E8E7FF',
  successGreen: '#42C77B',
  warningAmber: '#FFB84D',
  errorCoral: '#FF6B6B',
} as const;

export type ThemeColors = {
  background: string;
  backgroundGradient: readonly [string, string, ...string[]];
  card: string;
  cardSoft: string;
  text: string;
  textSoft: string;
  textOnDark: string;
  textOnDarkSoft: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
};

const baseTheme: ThemeColors = {
  background: palette.mistWhite,
  backgroundGradient: ['#EAF4FF', '#F1EEFF', '#FDF4E7'],
  card: '#FFFFFF',
  cardSoft: palette.lavenderFog,
  text: palette.deepNavy,
  textSoft: '#5B7288',
  textOnDark: '#FFFFFF',
  textOnDarkSoft: 'rgba(255,255,255,0.78)',
  primary: palette.brainBlue,
  secondary: palette.softPurple,
  accent: palette.aquaMint,
  success: palette.successGreen,
  warning: palette.warningAmber,
  error: palette.errorCoral,
  border: 'rgba(16,42,67,0.08)',
  shadow: palette.deepNavy,
};

const highContrastTheme: ThemeColors = {
  ...baseTheme,
  background: '#FFFFFF',
  backgroundGradient: ['#FFFFFF', '#F2F6FA', '#F2F6FA'],
  text: '#0A1C2E',
  textSoft: '#33475C',
  textOnDarkSoft: 'rgba(255,255,255,0.92)',
  primary: '#1B63C4',
  secondary: '#5F49E6',
  accent: '#0E9C89',
  success: '#1F9D58',
  error: '#E04545',
  border: 'rgba(10,28,46,0.28)',
};

export function getThemeColors(highContrast: boolean): ThemeColors {
  return highContrast ? highContrastTheme : baseTheme;
}

/** Gradients used by screen backgrounds around the mind island. */
export const gradients = {
  home: ['#DDEFFF', '#E9E5FF', '#FFF3E0'],
  daily: ['#D8F6F0', '#E2ECFF', '#F6ECFF'],
  focus: ['#102A43', '#1C4470', '#2F80ED'],
  memory: ['#E5F9E9', '#DFF5EF', '#EAF4FF'],
  color: ['#FFF1E8', '#FFE9F0', '#EFE9FF'],
  results: ['#FFE9CF', '#FFDDE4', '#EDE7FF'],
  progress: ['#DFF3FF', '#E6E9FF', '#E8FBF4'],
  navigation: ['#E0F3FF', '#DDF6EE', '#FDF2DC'],
} as const;
