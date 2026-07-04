export type PlayStyle = 'relaxed' | 'balanced' | 'challenge';

export type PlayerSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  relaxedMode: boolean;
  biggerText: boolean;
  playStyle: PlayStyle;
  onboardingDone: boolean;
};

export const defaultSettings: PlayerSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  relaxedMode: false,
  biggerText: false,
  playStyle: 'balanced',
  onboardingDone: false,
};
