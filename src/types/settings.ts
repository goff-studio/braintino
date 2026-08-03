export type DifficultyMode = 'relaxed' | 'balanced' | 'challenging';

export type ReminderFrequency = 'daily' | 'everyOtherDay' | 'weekdays';

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
  /**
   * Practice reminder, delivered as a LOCAL scheduled notification —
   * no backend or push service involved. Off by default; turning it on
   * requires the OS notification permission.
   */
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  /** Reminder delivery time, 24-hour clock. */
  reminderHour: number;
  reminderMinute: number;
  /**
   * Date key (YYYY-MM-DD) anchoring the every-other-day cadence: reminders
   * fire on days an even number of days from the anchor. Null until the
   * reminder is first configured.
   */
  reminderAnchor: string | null;
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
  reminderEnabled: false,
  reminderFrequency: 'daily',
  reminderHour: 9,
  reminderMinute: 0,
  reminderAnchor: null,
};
