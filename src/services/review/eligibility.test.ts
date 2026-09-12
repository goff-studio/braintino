import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AssessmentResult } from '@/types/assessment';
import type { MiniGameResult, SessionState } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';
import { evaluateRatingEligibility } from '@/services/review/eligibility';

function progress(partial: Partial<PlayerProgress> = {}): PlayerProgress {
  return {
    schemaVersion: 2,
    globalLevel: 1,
    xp: 0,
    streak: 0,
    totalSessions: 0,
    earnedBadges: {},
    miniGameProgress: {},
    minutesByDate: {},
    practiceByDate: {},
    dailyHistory: [],
    ...partial,
  };
}

function result(accuracy: number, completed = true): MiniGameResult {
  return {
    miniGameId: 'focus_flash',
    level: 4,
    accuracy,
    completedRounds: 8,
    mistakes: 0,
    consistency: accuracy,
    completionRate: completed ? 1 : 0.5,
    practiceScore: Math.round(accuracy * 100),
    stars: accuracy >= 0.9 ? 3 : accuracy >= 0.75 ? 2 : 1,
    xp: 20,
    skillScores: { speed: 50 },
    completed,
  };
}

function dailySession(accuracies: number[], allCompleted = true): SessionState {
  return {
    mode: 'daily',
    plan: ['focus_flash', 'route_recall', 'pattern_garden'],
    index: 2,
    results: accuracies.map((a) => result(a, allCompleted)),
    dateKey: '2026-09-12',
  };
}

function assessment(score: number): AssessmentResult {
  return {
    id: 'focus_snapshot',
    score,
    focus: score,
    speed: score,
    consistency: score,
    accuracy: score / 100,
    completedRounds: 18,
    mistakes: 0,
    durationSec: 90,
    completedAt: '2026-09-12T00:00:00.000Z',
    source: 'today',
    band: { label: 'test', blurb: 'test' },
  };
}

describe('evaluateRatingEligibility', () => {
  it('never asks on practice or incomplete daily', () => {
    const p = progress({ dailyHistory: ['2026-09-12'], streak: 1 });
    const practice: SessionState = {
      ...dailySession([0.9, 0.9, 0.9]),
      mode: 'practice',
      plan: ['focus_flash'],
      index: 0,
      results: [result(0.95)],
    };
    assert.equal(evaluateRatingEligibility({ progress: p, session: practice }).ask, false);
    assert.equal(evaluateRatingEligibility({ progress: p, session: null }).reason, 'not_daily_complete');

    const incomplete = dailySession([0.9, 0.9]);
    incomplete.results = [result(0.9), result(0.9)];
    assert.equal(
      evaluateRatingEligibility({ progress: p, session: incomplete }).reason,
      'not_daily_complete'
    );
  });

  it('never asks on a frustrated / failed session', () => {
    const p = progress({ dailyHistory: ['2026-09-12'], streak: 1 });
    const low = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.4, 0.5, 0.45]),
    });
    assert.deepEqual(low, { ask: false, reason: 'frustrated_session' });

    const unfinished = evaluateRatingEligibility({
      progress: progress({ dailyHistory: ['2026-09-11', '2026-09-12'], streak: 2 }),
      session: dailySession([0.9, 0.9, 0.9], false),
    });
    assert.equal(unfinished.reason, 'frustrated_session');
  });

  it('asks after a strong first daily (high accuracy)', () => {
    const p = progress({ dailyHistory: ['2026-09-12'], streak: 1 });
    const decision = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.88, 0.9, 0.86]),
    });
    assert.equal(decision.ask, true);
    if (decision.ask) {
      assert.equal(decision.reason, 'strong_session_1');
      assert.equal(decision.dailyDays, 1);
    }
  });

  it('asks after a successful first daily plus a strong Focus Snapshot', () => {
    const p = progress({ dailyHistory: ['2026-09-12'], streak: 1 });
    const without = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.72, 0.74, 0.76]),
    });
    assert.equal(without.reason, 'session_1_not_strong');

    const withSnap = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.72, 0.74, 0.76]),
      lastAssessment: assessment(72),
    });
    assert.equal(withSnap.ask, true);
    if (withSnap.ask) assert.equal(withSnap.reason, 'strong_session_1');
  });

  it('softens early ask on a day 2–3 streak when the session is not frustrated', () => {
    const p = progress({
      dailyHistory: ['2026-09-11', '2026-09-12'],
      streak: 2,
    });
    const decision = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.71, 0.73, 0.72]),
    });
    assert.equal(decision.ask, true);
    if (decision.ask) assert.equal(decision.reason, 'early_streak');
  });

  it('still asks on a later successful daily if the early window was missed', () => {
    const p = progress({
      dailyHistory: ['2026-09-08', '2026-09-10', '2026-09-12'],
      streak: 1,
    });
    const decision = evaluateRatingEligibility({
      progress: p,
      session: dailySession([0.8, 0.78, 0.82]),
    });
    assert.equal(decision.ask, true);
    if (decision.ask) assert.equal(decision.reason, 'successful_session');
  });
});
