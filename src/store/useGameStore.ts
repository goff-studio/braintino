import { create } from 'zustand';
import { gameConfig } from '@/constants/gameConfig';
import { checkNewBadges, type BadgeDef } from '@/data/badges';
import { applyXp } from '@/data/levels';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { calculateNextLevel, getStartingLevel } from '@/game/engines/difficulty';
import { reminderContentFor, shouldLogD1Return } from '@/game/engines/habitLoop';
import { getWeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import {
  advanceSession,
  createDailySession,
  createPracticeSession,
  createWeeklySession,
  isSessionComplete,
  recordResult,
  sessionTotals,
} from '@/game/engines/session';
import {
  trackAssessmentCompleted,
  trackAssessmentStarted,
} from '@/services/analytics/assessmentEvents';
import {
  trackFreePlayStarted,
  trackWeeklyChallengeCompleted,
  trackWeeklyChallengeStarted,
  type FreePlaySource,
} from '@/services/analytics/catalogEvents';
import {
  trackFirstSession,
  trackOnboardingCompleted,
  type OnboardingExit,
} from '@/services/analytics/funnelEvents';
import {
  trackD1Return,
  trackDailyCompleted,
  trackReminderEnabled,
  type ReminderEnabledSource,
} from '@/services/analytics/habitEvents';
import { setAnalyticsConsent, setTrafficSourceProperty, trackEvent } from '@/services/analytics/analytics';
import {
  rememberTrafficSource,
  type TrafficSource,
} from '@/services/analytics/trafficSource';
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
import type { AssessmentResult, AssessmentSource } from '@/types/assessment';
import type { MiniGameId, MiniGameResult, SessionState } from '@/types/game';
import type { MiniGameProgress, PlayerProgress } from '@/types/progress';
import {
  defaultSettings,
  type DifficultyMode,
  type PlayerSettings,
  type ReminderFrequency,
} from '@/types/settings';
import { applyAppLocale } from '@/i18n';
import { daysAgoKey, todayKey, yesterdayKey } from '@/utils/date';

const MAX_RECENT_RESULTS = 15;

type ReminderConfig = {
  frequency?: ReminderFrequency;
  hour?: number;
  minute?: number;
  source?: ReminderEnabledSource;
};

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
  /** Last completed Focus Snapshot (entertainment only). */
  lastAssessment: AssessmentResult | null;
  /** Entry source for the in-progress snapshot (funnel #11). */
  assessmentSource: AssessmentSource;

  hydrate: () => Promise<void>;
  /** Log d1_return after analytics init (once per install). */
  maybeTrackD1Return: () => void;
  /** Persist AppsFlyer organic vs paid and set the Firebase user property. */
  applyTrafficSource: (source: TrafficSource) => void;
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
  completeOnboarding: (
    mode: DifficultyMode,
    prefs: Partial<PlayerSettings>,
    next?: OnboardingExit
  ) => void;
  /**
   * Seed the starting level from the onboarding warm-up staircase: the
   * calibrated exercise starts at the placement, every other exercise
   * inherits it via getStartingLevel on first play.
   */
  completeCalibration: (placement: number, blocksPlayed: number) => void;
  /** Begin a Focus Snapshot. Logs assessment_started; does not start a practice session. */
  startAssessment: (source: AssessmentSource) => void;
  /** Persist a finished snapshot and log assessment_completed. */
  completeAssessment: (result: AssessmentResult) => void;

  startDailySession: () => SessionState;
  startPracticeSession: (gameId: MiniGameId, source?: FreePlaySource) => SessionState;
  startWeeklySession: () => SessionState;
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
  lastAssessment: null,
  assessmentSource: 'deeplink',

  hydrate: async () => {
    // Settings first: the v1→v2 progress migration maps old levels onto the
    // new scale using the player's difficulty mode.
    const settings = await storage.loadSettings();
    const progress = await storage.loadProgress(settings.difficultyMode);
    const lastAssessment = await storage.loadLastAssessment();
    // Cached entitlement verdict first (sync ad gating at boot); the change
    // listener keeps the store current once RevenueCat configures.
    const adFree = await PurchaseService.loadCachedAdFree();
    PurchaseService.subscribe((value) => set({ adFree: value }));
    setSoundEnabled(settings.soundEnabled);
    setHapticsEnabled(settings.hapticsEnabled);

    const today = todayKey();
    const nextSettings = settings.firstOpenDate
      ? settings
      : {
          ...settings,
          firstOpenDate: today,
          // Existing installs already past onboarding are not a D1 cohort.
          d1ReturnLogged: settings.onboardingDone,
        };
    if (nextSettings !== settings) {
      storage.saveSettings(nextSettings);
    }
    rememberTrafficSource(nextSettings.trafficSource);
    applyAppLocale(nextSettings.localePreference);

    set({ progress, settings: nextSettings, adFree, lastAssessment, hydrated: true });
    // Reconcile the local reminder schedule with settings: refreshes the
    // rolling every-other-day window and catches a permission revoked in
    // system Settings since last launch. Copy is streak / next-session aware.
    if (nextSettings.reminderEnabled) {
      syncReminder(
        nextSettings.reminderFrequency,
        nextSettings.reminderHour,
        nextSettings.reminderMinute,
        nextSettings.reminderAnchor ?? today,
        reminderContentFor(progress, today, nextSettings.personalPlan)
      ).then((active) => {
        if (!active) get().updateSettings({ reminderEnabled: false });
      });
    }
  },

  /** Fire d1_return once analytics is up — hydrate only stamps firstOpenDate. */
  maybeTrackD1Return: () => {
    const { settings, progress } = get();
    const today = todayKey();
    const d1 = shouldLogD1Return({
      firstOpenDate: settings.firstOpenDate,
      d1ReturnLogged: settings.d1ReturnLogged,
      today,
    });
    if (!d1.log) return;
    trackD1Return({
      daysSinceFirstOpen: d1.daysSinceFirstOpen,
      streak: progress.streak,
      completedDailyYesterday: progress.lastDailyCompletedDate === yesterdayKey(),
    });
    get().updateSettings({ d1ReturnLogged: true });
  },

  applyTrafficSource: (source) => {
    rememberTrafficSource(source);
    void setTrafficSourceProperty(source);
    if (get().settings.trafficSource !== source) {
      get().updateSettings({ trafficSource: source });
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
    if (settings.localePreference !== prev.localePreference) {
      applyAppLocale(settings.localePreference);
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
    await scheduleReminder(
      frequency,
      hour,
      minute,
      anchor,
      reminderContentFor(get().progress, todayKey(), get().settings.personalPlan)
    );
    get().updateSettings({
      reminderEnabled: true,
      reminderFrequency: frequency,
      reminderHour: hour,
      reminderMinute: minute,
      reminderAnchor: anchor,
    });
    trackReminderEnabled({
      source: config?.source ?? 'profile',
      frequency,
      hour,
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
      scheduleReminder(
        frequency,
        hour,
        minute,
        anchor,
        reminderContentFor(get().progress, todayKey(), get().settings.personalPlan)
      ).catch(() => {});
    }
  },

  completeOnboarding: (mode, prefs, next = 'home') => {
    get().updateSettings({
      ...prefs,
      difficultyMode: mode,
      onboardingDone: true,
    });
    const plan = prefs.personalPlan ?? get().settings.personalPlan;
    trackOnboardingCompleted({
      mode,
      next,
      reminderEnabled: get().settings.reminderEnabled,
      goal: plan?.goal,
      ageBand: plan?.ageBand,
    });
  },

  completeCalibration: (placement, blocksPlayed) => {
    const state = get();
    const progress: PlayerProgress = {
      ...state.progress,
      miniGameProgress: { ...state.progress.miniGameProgress },
    };
    const gameId = gameConfig.calibration.gameId;
    const existing = progress.miniGameProgress[gameId];
    // Never lower a level that real play has already established.
    progress.miniGameProgress[gameId] = existing
      ? { ...existing, level: Math.max(existing.level, placement) }
      : initialMiniGameProgress(placement);
    const leveled = applyXp(progress.globalLevel, progress.xp, gameConfig.calibration.xpReward);
    progress.globalLevel = leveled.level;
    progress.xp = leveled.xp;
    set({ progress });
    storage.saveProgress(progress);
    trackEvent('calibration_completed', {
      placement_level: placement,
      blocks: blocksPlayed,
      mode: state.settings.difficultyMode,
    });
  },

  startAssessment: (source) => {
    set({ assessmentSource: source });
    trackAssessmentStarted(source, gameConfig.assessment.id);
  },

  completeAssessment: (result) => {
    set({ lastAssessment: result, assessmentSource: result.source });
    storage.saveLastAssessment(result);
    trackAssessmentCompleted(result);
  },

  startDailySession: () => {
    const today = todayKey();
    const { progress, settings } = get();
    const plan = getTodayDailyPlan(today, progress, settings.personalPlan);
    const session = createDailySession(plan.games, today);
    set({ session, lastResult: null });
    return session;
  },

  startPracticeSession: (gameId, source = 'practice') => {
    const session = createPracticeSession(gameId, todayKey());
    set({ session, lastResult: null });
    trackFreePlayStarted({ gameId, source });
    return session;
  },

  startWeeklySession: () => {
    const state = get();
    const today = todayKey();
    const plan = getWeeklyChallengePlan(state.progress, {
      onboardingDone: state.settings.onboardingDone,
      lastDailyCompletedDate: state.progress.lastDailyCompletedDate,
      globalLevel: state.progress.globalLevel,
    });
    const session = createWeeklySession(plan.games, plan.weekKey, plan.twist, today);
    set({ session, lastResult: null });
    trackWeeklyChallengeStarted({
      weekKey: plan.weekKey,
      title: plan.title,
      twist: plan.twist,
    });
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
      state.settings.difficultyMode,
      mg.sessionsPlayed
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
      if (progress.totalSessions === 1) {
        trackFirstSession({ mode: session.mode });
      }
      if (session.mode === 'daily' && progress.lastDailyCompletedDate !== today) {
        progress.streak =
          progress.lastDailyCompletedDate === yesterdayKey() ? progress.streak + 1 : 1;
        progress.lastDailyCompletedDate = today;
        progress.dailyHistory = [...progress.dailyHistory, today].slice(-60);
        const plan = getTodayDailyPlan(today, progress, state.settings.personalPlan);
        trackDailyCompleted({
          streak: progress.streak,
          totalSessions: progress.totalSessions,
          planTitle: plan.title,
        });
        if (state.settings.reminderEnabled) {
          scheduleReminder(
            state.settings.reminderFrequency,
            state.settings.reminderHour,
            state.settings.reminderMinute,
            state.settings.reminderAnchor ?? today,
            reminderContentFor(progress, today, state.settings.personalPlan)
          ).catch(() => {});
        }
      }
      if (
        session.mode === 'weekly' &&
        session.weekKey &&
        progress.lastWeeklyChallengeWeek !== session.weekKey
      ) {
        progress.lastWeeklyChallengeWeek = session.weekKey;
        const totals = sessionTotals(session);
        const weeklyPlan = getWeeklyChallengePlan(progress, {
          onboardingDone: state.settings.onboardingDone,
          lastDailyCompletedDate: progress.lastDailyCompletedDate,
          globalLevel: progress.globalLevel,
        });
        trackWeeklyChallengeCompleted({
          weekKey: session.weekKey,
          title: weeklyPlan.title,
          twist: session.twist ?? weeklyPlan.twist,
          avgAccuracy: totals.avgAccuracy,
          totalSessions: progress.totalSessions,
        });
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
    await storage.clearLastAssessment();
    set({
      progress: storage.createDefaultProgress(),
      session: null,
      lastResult: null,
      lastEarnedBadges: [],
      lastAssessment: null,
      assessmentSource: 'deeplink',
    });
  },
}));
