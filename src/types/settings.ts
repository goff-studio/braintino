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
  /**
   * "Analytics & personalized content" consent. Gates Firebase Analytics and
   * AppsFlyer attribution together (ad PERSONALIZATION is governed separately
   * by iOS ATT + the UMP/GDPR consent form in AdService). Default on; the
   * player can opt out any time in Settings.
   */
  analyticsEnabled: boolean;
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
  analyticsEnabled: true,
};
