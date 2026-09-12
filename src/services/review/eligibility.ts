import { gameConfig } from '@/constants/gameConfig';
import type { AssessmentResult } from '@/types/assessment';
import type { SessionState } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';

/**
 * Rating-ask eligibility (issue #1 — store social proof without tanking the average).
 *
 * Timing (softened early ask — this comment is the source of truth):
 *   1. Strong session 1 — first completed daily with high accuracy
 *      (>= `gameConfig.adaptive.raise`, 85%), OR a successful first daily
 *      plus a recent Focus Snapshot in a clear/peak band (score >= 70).
 *   2. Day 2–3 streak — completed daily while streak is 2 or 3, session
 *      not frustrated. Uses the habit-loop streak signal (#4).
 *   3. Later successful daily — if we never asked (rough start), a later
 *      completed daily that is not frustrated still qualifies so happy
 *      users are not lost. Reason: `successful_session`.
 *
 * Hard vetoes (never prompt on a failed / frustrated session):
 *   - Incomplete daily / mid-session / practice-only results
 *   - Any exercise unfinished, or session average accuracy below
 *     `gameConfig.adaptive.stableFloor` (70%) — the same band as
 *     “demanding session / difficulty is adjusting” feedback
 *   - Already accepted or dismissed (one-time; enforced by review.ts)
 *   - Native in-app review unavailable (enforced by review.ts)
 *
 * Growth milestone: 50 real store ratings (`RATING_GROWTH_MILESTONE`).
 * Leading indicator is `rating_ask_accepted` in Firebase — see
 * `docs/rating-ask.md`. No in-app dashboard. Not medical / not diagnostic.
 */

/** Path-to-50 store ratings. Count `rating_ask_accepted` in Firebase / a sheet. */
export const RATING_GROWTH_MILESTONE = 50;

/** Session average at/above this is “high accuracy” for a day-1 ask. */
const STRONG_ACCURACY = gameConfig.adaptive.raise; // 0.85

/** Below this the session felt frustrating — never ask. */
const FRUSTRATED_ACCURACY = gameConfig.adaptive.stableFloor; // 0.70

/** Focus Snapshot score that boosts a successful first daily (Clear / Peak). */
const STRONG_ASSESSMENT_SCORE = 70;

export type RatingAskReason = 'strong_session_1' | 'early_streak' | 'successful_session';

export type RatingAskSkipReason =
  | 'not_daily_complete'
  | 'frustrated_session'
  | 'session_1_not_strong';

export type RatingAskEligible = {
  ask: true;
  reason: RatingAskReason;
  streak: number;
  dailyDays: number;
  avgAccuracy: number;
};

export type RatingAskSkipped = {
  ask: false;
  reason: RatingAskSkipReason;
};

export type RatingAskDecision = RatingAskEligible | RatingAskSkipped;

export type RatingAskContext = {
  progress: PlayerProgress;
  session: SessionState | null;
  lastAssessment?: AssessmentResult | null;
};

export function sessionFeltFrustrated(
  session: SessionState,
  avgAccuracy: number
): boolean {
  const allCompleted = session.results.length > 0 && session.results.every((r) => r.completed);
  return !allCompleted || avgAccuracy < FRUSTRATED_ACCURACY;
}

/**
 * Pure eligibility (storage + StoreReview availability are applied in review.ts).
 *
 * Call only after the daily session has been recorded on `progress` (streak
 * and `dailyHistory` already include today).
 */
export function evaluateRatingEligibility(ctx: RatingAskContext): RatingAskDecision {
  const { progress, session, lastAssessment } = ctx;
  const dailyComplete =
    session?.mode === 'daily' &&
    session.results.length >= session.plan.length &&
    session.plan.length > 0;

  if (!session || !dailyComplete) {
    return { ask: false, reason: 'not_daily_complete' };
  }

  const avgAccuracy =
    session.results.reduce((sum, r) => sum + r.accuracy, 0) / session.results.length;

  if (sessionFeltFrustrated(session, avgAccuracy)) {
    return { ask: false, reason: 'frustrated_session' };
  }

  const dailyDays = progress.dailyHistory.length;
  const streak = progress.streak;
  const isStrong = avgAccuracy >= STRONG_ACCURACY;
  const assessmentBoost =
    lastAssessment != null && lastAssessment.score >= STRONG_ASSESSMENT_SCORE;

  const eligible = (reason: RatingAskReason): RatingAskEligible => ({
    ask: true,
    reason,
    streak,
    dailyDays,
    avgAccuracy,
  });

  // Softened early ask: strong first daily (accuracy or snapshot), else wait.
  if (dailyDays <= 1) {
    if (isStrong || assessmentBoost) return eligible('strong_session_1');
    return { ask: false, reason: 'session_1_not_strong' };
  }

  if (streak >= 2 && streak <= 3) {
    return eligible('early_streak');
  }

  return eligible('successful_session');
}
