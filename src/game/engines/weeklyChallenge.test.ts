import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WEEKLY_CHALLENGE_THEMES } from '@/data/weeklyChallenges';
import { applyWeeklyTwist, getWeeklyChallengePlan } from '@/game/engines/weeklyChallenge';
import type { DifficultyConfig, MiniGameId } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';
import { weekIndexFromKey, weekStartKey } from '@/utils/date';

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

function baseDifficulty(): DifficultyConfig {
  return {
    level: 4,
    choices: 4,
    previewMs: 1000,
    distractors: 0,
    ruleSwitchFrequency: 5,
    conflictRate: 0.5,
    listMode: 'items',
    focusRule: 'colorMatch',
    reverse: false,
    rotateMap: false,
  };
}

describe('weekly challenge plan', () => {
  const monday = new Date(2026, 8, 7); // Monday 2026-09-07
  const weekKey = weekStartKey(monday);

  it('is deterministic for the same week', () => {
    const unlock = { onboardingDone: true, globalLevel: 1, lastDailyCompletedDate: '2026-09-07' };
    const a = getWeeklyChallengePlan(progress(), unlock, monday);
    const b = getWeeklyChallengePlan(progress(), unlock, new Date(2026, 8, 12)); // Saturday
    assert.equal(a.weekKey, weekKey);
    assert.equal(b.weekKey, weekKey);
    assert.deepEqual(a.games, b.games);
    assert.equal(a.title, b.title);
    assert.equal(a.twist, b.twist);
    assert.equal(a.games.length, 3);
  });

  it('rotates theme by week index and differs from the next week', () => {
    const unlock = { onboardingDone: true, globalLevel: 1, lastDailyCompletedDate: '2026-09-07' };
    const thisWeek = getWeeklyChallengePlan(progress(), unlock, monday);
    const nextWeek = getWeeklyChallengePlan(progress(), unlock, new Date(2026, 8, 14));
    const expected = WEEKLY_CHALLENGE_THEMES[Math.abs(weekIndexFromKey(weekKey)) % WEEKLY_CHALLENGE_THEMES.length];
    assert.equal(thisWeek.twist, expected.twist);
    assert.equal(thisWeek.title, expected.title);
    assert.notEqual(thisWeek.weekKey, nextWeek.weekKey);
    assert.notEqual(thisWeek.twist + thisWeek.title, nextWeek.twist + nextWeek.title);
  });

  it('marks complete only for the matching week key', () => {
    const unlock = { onboardingDone: true, globalLevel: 1, lastDailyCompletedDate: '2026-09-07' };
    const done = getWeeklyChallengePlan(progress({ lastWeeklyChallengeWeek: weekKey }), unlock, monday);
    const fresh = getWeeklyChallengePlan(progress(), unlock, monday);
    assert.equal(done.completed, true);
    assert.equal(fresh.completed, false);
  });

  it('falls back to unlocked games before the catalog opens', () => {
    const unlock = { onboardingDone: true, globalLevel: 1 };
    const plan = getWeeklyChallengePlan(progress(), unlock, monday);
    const level1: MiniGameId[] = ['focus_flash', 'route_recall', 'pattern_garden'];
    assert.equal(plan.games.length, 3);
    assert.ok(plan.games.every((id) => level1.includes(id)));
  });
});

describe('weekly mode twist', () => {
  it('does not change the stored difficulty level', () => {
    const base = baseDifficulty();
    const twisted = applyWeeklyTwist('pattern_garden', base, 'reverse');
    assert.equal(twisted.level, base.level);
    assert.equal(twisted.reverse, true);
    assert.equal(base.reverse, false);
  });

  it('applies engine flags already supported by each game', () => {
    const base = baseDifficulty();
    assert.equal(applyWeeklyTwist('route_recall', base, 'reverse').rotateMap, true);
    assert.equal(applyWeeklyTwist('focus_flash', base, 'dual').focusRule, 'dual');
    assert.equal(applyWeeklyTwist('market_memory', base, 'everyday').listMode, 'category');
    assert.ok((applyWeeklyTwist('color_switch', base, 'switch').ruleSwitchFrequency ?? 0) < 5);
  });
});
