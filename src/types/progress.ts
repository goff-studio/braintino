import type { MiniGameId, MiniGameResult } from './game';

export type MiniGameProgress = {
  level: number;
  bestStars: number;
  bestAccuracy: number;
  sessionsPlayed: number;
  lastResults: MiniGameResult[];
};

export type PlayerProgress = {
  globalLevel: number;
  xp: number;
  coins: number;
  streak: number;
  lastPlayedDate?: string;
  /** Date key of the last fully completed daily session. */
  lastDailyCompletedDate?: string;
  totalSessions: number;
  totalStars: number;
  unlockedCosmetics: string[];
  selectedCosmetics: Record<string, string>;
  miniGameProgress: Partial<Record<MiniGameId, MiniGameProgress>>;
  /** Minutes played per date key, pruned to the last 14 days. */
  minutesByDate: Record<string, number>;
  /** Date keys on which a daily session was completed (last 60 days). */
  dailyHistory: string[];
};
