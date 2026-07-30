export type DifficultyMode = 'relaxed' | 'balanced' | 'challenging';

export type PlayerSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  biggerText: boolean;
  /** Practice difficulty mode: baseline level, adaptive floor, and pacing. */
  difficultyMode: DifficultyMode;
  onboardingDone: boolean;
  /**
   * "Analytics & personalized content" consent. Gates Firebase Analytics and
   * AppsFlyer attribution together (ad PERSONALIZATION is governed separately
   * by iOS ATT + the UMP/GDPR consent form in AdService). Default on; the
   * player can opt out any time in Profile.
   */
  analyticsEnabled: boolean;
};

export const defaultSettings: PlayerSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  biggerText: false,
  difficultyMode: 'balanced',
  onboardingDone: false,
  analyticsEnabled: true,
};
