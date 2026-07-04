import { create } from 'zustand';
import { getCosmetic } from '@/data/cosmetics';
import { applyXp } from '@/data/levels';
import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { calculateNextLevel } from '@/game/engines/difficulty';
import {
  advanceSession,
  createDailySession,
  createPracticeSession,
  isSessionComplete,
  recordResult,
} from '@/game/engines/session';
import { setSoundEnabled } from '@/services/audio/audio';
import { setHapticsEnabled } from '@/services/haptics/haptics';
import * as storage from '@/services/storage/storage';
import type { MiniGameId, MiniGameResult, SessionState } from '@/types/game';
import type { MiniGameProgress, PlayerProgress } from '@/types/progress';
import { defaultSettings, type PlayerSettings } from '@/types/settings';
import { daysAgoKey, todayKey, yesterdayKey } from '@/utils/date';

const MAX_RECENT_RESULTS = 15;

function defaultMiniGameProgress(): MiniGameProgress {
  return { level: 1, bestStars: 0, bestAccuracy: 0, sessionsPlayed: 0, lastResults: [] };
}

type GameStore = {
  hydrated: boolean;
  progress: PlayerProgress;
  settings: PlayerSettings;
  session: SessionState | null;
  /** The most recently scored result, shown on the results screen. */
  lastResult: MiniGameResult | null;

  hydrate: () => Promise<void>;
  updateSettings: (partial: Partial<PlayerSettings>) => void;
  completeOnboarding: (style: PlayerSettings['playStyle'], prefs: Partial<PlayerSettings>) => void;

  startDailySession: () => SessionState;
  startPracticeSession: (gameId: MiniGameId) => SessionState;
  /** Score a finished mini-game, update progress, and advance the session. */
  completeGame: (result: MiniGameResult, minutesPlayed: number) => void;
  advanceToNextGame: () => void;
  abandonSession: () => void;

  unlockCosmetic: (id: string) => boolean;
  selectCosmetic: (slot: string, id: string) => void;
  resetAllProgress: () => Promise<void>;
};

export const useGameStore = create<GameStore>((set, get) => ({
  hydrated: false,
  progress: storage.createDefaultProgress(),
  settings: defaultSettings,
  session: null,
  lastResult: null,

  hydrate: async () => {
    const [progress, settings] = await Promise.all([storage.loadProgress(), storage.loadSettings()]);
    setSoundEnabled(settings.soundEnabled);
    setHapticsEnabled(settings.hapticsEnabled);
    set({ progress, settings, hydrated: true });
  },

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    setSoundEnabled(settings.soundEnabled);
    setHapticsEnabled(settings.hapticsEnabled);
    set({ settings });
    storage.saveSettings(settings);
  },

  completeOnboarding: (style, prefs) => {
    get().updateSettings({
      ...prefs,
      playStyle: style,
      relaxedMode: style === 'relaxed' ? true : prefs.relaxedMode ?? false,
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
      minutesByDate: { ...state.progress.minutesByDate },
      dailyHistory: [...state.progress.dailyHistory],
    };

    // Per-mini-game progress and adaptive level.
    const mg = progress.miniGameProgress[result.miniGameId] ?? defaultMiniGameProgress();
    const nextLevel = calculateNextLevel(mg.level, result, mg.lastResults);
    progress.miniGameProgress[result.miniGameId] = {
      level: nextLevel,
      bestStars: Math.max(mg.bestStars, result.stars),
      bestAccuracy: Math.max(mg.bestAccuracy, result.accuracy),
      sessionsPlayed: mg.sessionsPlayed + 1,
      lastResults: [...mg.lastResults, result].slice(-MAX_RECENT_RESULTS),
    };

    // Global rewards.
    const leveled = applyXp(progress.globalLevel, progress.xp, result.xp);
    progress.globalLevel = leveled.level;
    progress.xp = leveled.xp;
    progress.coins += result.coins;
    progress.totalStars += result.stars;
    progress.lastPlayedDate = today;
    progress.minutesByDate[today] = (progress.minutesByDate[today] ?? 0) + minutesPlayed;

    // Prune minutes history to 14 days.
    const cutoff = daysAgoKey(14);
    for (const key of Object.keys(progress.minutesByDate)) {
      if (key < cutoff) delete progress.minutesByDate[key];
    }

    // Session bookkeeping — the single centralized completion path.
    let session = state.session ? recordResult(state.session, result) : null;
    if (session && isSessionComplete(session)) {
      progress.totalSessions += 1;
      if (session.mode === 'daily' && progress.lastDailyCompletedDate !== today) {
        progress.streak =
          progress.lastDailyCompletedDate === yesterdayKey() ? progress.streak + 1 : 1;
        progress.lastDailyCompletedDate = today;
        progress.dailyHistory = [...progress.dailyHistory, today].slice(-60);
      }
    }

    set({ progress, session, lastResult: result });
    storage.saveProgress(progress);
  },

  advanceToNextGame: () => {
    const session = get().session;
    if (!session) return;
    set({ session: advanceSession(session) });
  },

  abandonSession: () => set({ session: null }),

  unlockCosmetic: (id) => {
    const cosmetic = getCosmetic(id);
    const progress = get().progress;
    if (!cosmetic || progress.unlockedCosmetics.includes(id) || progress.coins < cosmetic.cost) {
      return false;
    }
    const next: PlayerProgress = {
      ...progress,
      coins: progress.coins - cosmetic.cost,
      unlockedCosmetics: [...progress.unlockedCosmetics, id],
      selectedCosmetics: { ...progress.selectedCosmetics, [cosmetic.slot]: id },
    };
    set({ progress: next });
    storage.saveProgress(next);
    return true;
  },

  selectCosmetic: (slot, id) => {
    const progress = get().progress;
    if (!progress.unlockedCosmetics.includes(id)) return;
    const next = {
      ...progress,
      selectedCosmetics: { ...progress.selectedCosmetics, [slot]: id },
    };
    set({ progress: next });
    storage.saveProgress(next);
  },

  resetAllProgress: async () => {
    await storage.resetProgress();
    set({ progress: storage.createDefaultProgress(), session: null, lastResult: null });
  },
}));
