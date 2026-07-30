import type { MiniGameId, MiniGameResult, SessionState } from '@/types/game';

/**
 * Central session flow helpers.
 *
 * All transitions between games and back to the results/home screens flow
 * through here, so a future monetization step (e.g. an interstitial after a
 * completed daily session — see /src/services/monetization) can be inserted
 * in ONE place without touching screens.
 */

export function createDailySession(plan: MiniGameId[], dateKey: string): SessionState {
  return { mode: 'daily', plan, index: 0, results: [], dateKey };
}

export function createPracticeSession(gameId: MiniGameId, dateKey: string): SessionState {
  return { mode: 'practice', plan: [gameId], index: 0, results: [], dateKey };
}

export function currentGame(session: SessionState): MiniGameId | undefined {
  return session.plan[session.index];
}

export function recordResult(session: SessionState, result: MiniGameResult): SessionState {
  return { ...session, results: [...session.results, result] };
}

export function advanceSession(session: SessionState): SessionState {
  return { ...session, index: session.index + 1 };
}

export function isSessionComplete(session: SessionState): boolean {
  return session.index >= session.plan.length - 1 && session.results.length >= session.plan.length;
}

export function sessionTotals(session: SessionState): {
  xp: number;
  avgAccuracy: number;
  avgPracticeScore: number;
} {
  const count = session.results.length;
  const sums = session.results.reduce(
    (acc, r) => ({
      xp: acc.xp + r.xp,
      accuracy: acc.accuracy + r.accuracy,
      practiceScore: acc.practiceScore + r.practiceScore,
    }),
    { xp: 0, accuracy: 0, practiceScore: 0 }
  );
  return {
    xp: sums.xp,
    avgAccuracy: count > 0 ? sums.accuracy / count : 0,
    avgPracticeScore: count > 0 ? Math.round(sums.practiceScore / count) : 0,
  };
}
