import { create } from 'zustand';
import { checkNewBadges, type BadgeDef } from '@/data/badges';
import { applyXp } from '@/data/levels';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { calculateNextLevel, getStartingLevel } from '@/game/engines/difficulty';
import {
  advanceSession,
  createDailySession,
  createPracticeSession,
  isSessionComplete,
  recordResult,
} from '@/game/engines/session';
import { setAnalyticsConsent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import { setSoundEnabled } from '@/services/audio/audio';
import { PurchaseService } from '@/services/monetization/PurchaseService';
import { setHapticsEnabled } from '@/services/haptics/haptics';
import {
  cancelReminder,
  ensureReminderPermission,
  nextAnchorKey,
  scheduleReminder,
  syncReminder,
  type ReminderPermission,
} from '@/services/notifications/notifications';
import * as storage from '@/services/storage/storage';
import type { MiniGameId, MiniGameResult, SessionState } from '@/types/game';
import type { MiniGameProgress, PlayerProgress } from '@/types/progress';
import {
  defaultSettings,
  type DifficultyMode,
  type PlayerSettings,
  type ReminderFrequency,
} from '@/types/settings';
import { daysAgoKey, todayKey, yesterdayKey } from '@/utils/date';

const MAX_RECENT_RESULTS = 15;

type ReminderConfig = { frequency?: ReminderFrequency; hour?: number; minute?: number };

function initialMiniGameProgress(level: number): MiniGameProgress {
  return { level, bestPracticeScore: 0, bestAccuracy: 0, sessionsPlayed: 0, lastResults: [] };
}

type GameStore = {
  hydrated: boolean;
  /** Ad-free entitlement (RevenueCat); cached verdict at boot, live after. */
  adFree: boolean;
  progress: PlayerProgress;
  settings: PlayerSettings;
  session: SessionState | null;
  /** The most recently scored result, shown on the results screen. */
  lastResult: MiniGameResult | null;
  /** Milestones earned by the most recent result, for the results screen. */
  lastEarnedBadges: BadgeDef[];

  hydrate: () => Promise<void>;
  updateSettings: (partial: Partial<PlayerSettings>) => void;
  /**
   * Turn the practice reminder on/off, optionally setting frequency/time in
   * the same step (used by onboarding). Handles the OS permission and only
   * persists `reminderEnabled: true` once notifications are actually
   * scheduled; returns the permission outcome so the UI can react to
   * 'blocked' (must be enabled in system Settings).
   */
  setPracticeReminder: (enabled: boolean, config?: ReminderConfig) => Promise<ReminderPermission>;
  /** Change reminder frequency/time; reschedules if the reminder is on. */
  updateReminderConfig: (config: ReminderConfig) => void;
  completeOnboarding: (mode: DifficultyMode, prefs: Partial<PlayerSettings>) => void;

  startDailySession: () => SessionState;
  startPracticeSession: (gameId: MiniGameId) => SessionState;
  /** Score a finished mini-game, update progress, and advance the session. */
  completeGame: (result: MiniGameResult, minutesPlayed: number) => void;
  advanceToNextGame: () => void;
  abandonSession: () => void;

  /** Credit XP from a non-gameplay source (e.g. the rewarded bonus ad). */
  grantBonusXp: (amount: number) => void;
  resetAllProgress: () => Promise<void>;
};

export const useGameStore = create<GameStore>((set, get) => ({
  hydrated: false,
  adFree: false,
  progress: storage.createDefaultProgress(),
  settings: defaultSettings,
  session: null,
  lastResult: null,
  lastEarnedBadges: [],

  hydrate: async () => {
    // Settings first: the v1→v2 progress migration maps old levels onto the
    // new scale using the player's difficulty mode.
    const settings = await storage.loadSettings();
    const progress = await storage.loadProgress(settings.difficultyMode);
    // Cached entitlement verdict first (sync ad gating at boot); the
    // subscription keeps the store current once RevenueCat configures.
    const adFree = await PurchaseService.loadCachedAdFree();
    PurchaseService.subscribe((value) => set({ adFree: value }));
    setSoundEnabled(settings.soundEnabled);
    setHapticsEnabled(settings.hapticsEnabled);
    set({ progress, settings, adFree, hydrated: true });
    // Reconcile the local reminder schedule with settings: refreshes the
    // rolling every-other-day window and catches a permission revoked in
    // system Settings since last launch.
    if (settings.reminderEnabled) {
      syncReminder(
        settings.reminderFrequency,
        settings.reminderHour,
        settings.reminderMinute,
        settings.reminderAnchor ?? todayKey()
      ).then((active) => {
        if (!active) get().updateSettings({ reminderEnabled: false });
      });
    }
  },

  updateSettings: (partial) => {
    const prev = get().settings;
    const settings = { ...prev, ...partial };
    setSoundEnabled(settings.soundEnabled);
    setHapticsEnabled(settings.hapticsEnabled);
    // Propagate the consent toggle to Firebase + AppsFlyer without a restart.
    if (settings.analyticsEnabled !== prev.analyticsEnabled) {
      setAnalyticsConsent(settings.analyticsEnabled);
      AppsFlyerService.applyConsent(settings.analyticsEnabled);
    }
    set({ settings });
    storage.saveSettings(settings);
  },

  setPracticeReminder: async (enabled, config) => {
    if (!enabled) {
      await cancelReminder();
      get().updateSettings({ reminderEnabled: false });
      return 'granted';
    }
    const permission = await ensureReminderPermission();
    if (permission !== 'granted') return permission;
    const s = get().settings;
    const frequency = config?.frequency ?? s.reminderFrequency;
    const hour = config?.hour ?? s.reminderHour;
    const minute = config?.minute ?? s.reminderMinute;
    const anchor = nextAnchorKey(hour, minute);
    await scheduleReminder(frequency, hour, minute, anchor);
    get().updateSettings({
      reminderEnabled: true,
      reminderFrequency: frequency,
      reminderHour: hour,
      reminderMinute: minute,
      reminderAnchor: anchor,
    });
    return 'granted';
  },

  updateReminderConfig: (config) => {
    const s = get().settings;
    const frequency = config.frequency ?? s.reminderFrequency;
    const hour = config.hour ?? s.reminderHour;
    const minute = config.minute ?? s.reminderMinute;
    const anchor = nextAnchorKey(hour, minute);
    get().updateSettings({
      reminderFrequency: frequency,
      reminderHour: hour,
      reminderMinute: minute,
      reminderAnchor: anchor,
    });
    if (s.reminderEnabled) {
      scheduleReminder(frequency, hour, minute, anchor).catch(() => {});
    }
  },

  completeOnboarding: (mode, prefs) => {
    get().updateSettings({
      ...prefs,
      difficultyMode: mode,
      onboardingDone: true,
    });
  },

  startDailySession: () => {
    const today = todayKey();
    const plan = getTodayDailyPlan(today, get().progress);
    const session = createDailySession(plan.games, today);
    set({ session, lastResult: null });
    return session;
  },

  startPracticeSession: (gameId) => {
    const session = createPracticeSession(gameId, todayKey());
    set({ session, lastResult: null });
    return session;
  },

  completeGame: (result, minutesPlayed) => {
    const state = get();
    const today = todayKey();
    const progress: PlayerProgress = {
      ...state.progress,
      miniGameProgress: { ...state.progress.miniGameProgress },
      earnedBadges: { ...state.progress.earnedBadges },
      minutesByDate: { ...state.progress.minutesByDate },
      practiceByDate: { ...state.progress.practiceByDate },
      dailyHistory: [...state.progress.dailyHistory],
    };

    // Per-mini-game progress and adaptive level.
    const mg =
      progress.miniGameProgress[result.miniGameId] ??
      initialMiniGameProgress(getStartingLevel(progress, state.settings.difficultyMode));
    const nextLevel = calculateNextLevel(
      mg.level,
      result,
      mg.lastResults,
      state.settings.difficultyMode
    );
    const enriched: MiniGameResult = {
      ...result,
      difficultyDelta: nextLevel - mg.level,
      isPersonalBest: result.practiceScore > mg.bestPracticeScore && mg.sessionsPlayed > 0,
    };
    progress.miniGameProgress[result.miniGameId] = {
      level: nextLevel,
      bestPracticeScore: Math.max(mg.bestPracticeScore, result.practiceScore),
      bestAccuracy: Math.max(mg.bestAccuracy, result.accuracy),
      sessionsPlayed: mg.sessionsPlayed + 1,
      lastResults: [...mg.lastResults, enriched].slice(-MAX_RECENT_RESULTS),
    };

    // Global progression.
    const leveled = applyXp(progress.globalLevel, progress.xp, result.xp);
    progress.globalLevel = leveled.level;
    progress.xp = leveled.xp;
    progress.lastPlayedDate = today;
    progress.minutesByDate[today] = (progress.minutesByDate[today] ?? 0) + minutesPlayed;
    const daily = progress.practiceByDate[today] ?? { total: 0, count: 0 };
    progress.practiceByDate[today] = {
      total: daily.total + result.practiceScore,
      count: daily.count + 1,
    };

    // Prune histories.
    const minutesCutoff = daysAgoKey(14);
    for (const key of Object.keys(progress.minutesByDate)) {
      if (key < minutesCutoff) delete progress.minutesByDate[key];
    }
    const practiceCutoff = daysAgoKey(28);
    for (const key of Object.keys(progress.practiceByDate)) {
      if (key < practiceCutoff) delete progress.practiceByDate[key];
    }

    // Session bookkeeping — the single centralized completion path.
    let session = state.session ? recordResult(state.session, enriched) : null;
    const sessionCompleted = Boolean(session && isSessionComplete(session));
    if (session && sessionCompleted) {
      progress.totalSessions += 1;
      // Attribution engagement signal (no-op when opted out / module absent).
      AppsFlyerService.logEvent('session_completed', {
        mode: session.mode,
        total_sessions: progress.totalSessions,
      });
      if (session.mode === 'daily' && progress.lastDailyCompletedDate !== today) {
        progress.streak =
          progress.lastDailyCompletedDate === yesterdayKey() ? progress.streak + 1 : 1;
        progress.lastDailyCompletedDate = today;
        progress.dailyHistory = [...progress.dailyHistory, today].slice(-60);
      }
    }

    // Milestones — checked against the updated snapshot.
    const newBadges = checkNewBadges({ progress, result: enriched, sessionCompleted });
    for (const badge of newBadges) {
      progress.earnedBadges[badge.id] = today;
    }

    set({ progress, session, lastResult: enriched, lastEarnedBadges: newBadges });
    storage.saveProgress(progress);
  },

  advanceToNextGame: () => {
    const session = get().session;
    if (!session) return;
    set({ session: advanceSession(session) });
  },

  abandonSession: () => set({ session: null }),

  grantBonusXp: (amount) => {
    if (amount <= 0) return;
    const progress = { ...get().progress };
    const leveled = applyXp(progress.globalLevel, progress.xp, amount);
    progress.globalLevel = leveled.level;
    progress.xp = leveled.xp;
    set({ progress });
    storage.saveProgress(progress);
  },

  resetAllProgress: async () => {
    await storage.resetProgress();
    set({
      progress: storage.createDefaultProgress(),
      session: null,
      lastResult: null,
      lastEarnedBadges: [],
    });
  },
}));
