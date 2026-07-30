import type { MiniGameId, MiniGameResult } from './game';

export type MiniGameProgress = {
  level: number;
  bestPracticeScore: number;
  bestAccuracy: number;
  sessionsPlayed: number;
  lastResults: MiniGameResult[];
};

export type PlayerProgress = {
  schemaVersion: 2;
  globalLevel: number;
  xp: number;
  streak: number;
  lastPlayedDate?: string;
  /** Date key of the last fully completed daily session. */
  lastDailyCompletedDate?: string;
  totalSessions: number;
  /** badgeId → date key it was earned. */
  earnedBadges: Record<string, string>;
  miniGameProgress: Partial<Record<MiniGameId, MiniGameProgress>>;
  /** Minutes played per date key, pruned to the last 14 days. */
  minutesByDate: Record<string, number>;
  /** Practice-score accumulator per date key, pruned to the last 28 days. */
  practiceByDate: Record<string, { total: number; count: number }>;
  /** Date keys on which a daily session was completed (last 60 days). */
  dailyHistory: string[];
};
