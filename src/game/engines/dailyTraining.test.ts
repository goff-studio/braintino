import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generatePersonalPlan } from '@/game/engines/personalPlan';
import { getTodayDailyPlan, shouldUseOnboardingPlan } from '@/game/engines/dailyTraining';
import type { PlayerProgress } from '@/types/progress';

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

const personal = generatePersonalPlan({
  goal: 'memory',
  ageBand: '35_49',
  weakSpots: ['memory', 'everyday'],
  timeMinutes: 5,
});

describe('shouldUseOnboardingPlan', () => {
  it('is true only before the first daily completion', () => {
    assert.equal(shouldUseOnboardingPlan(progress(), personal), true);
    assert.equal(shouldUseOnboardingPlan(progress({ dailyHistory: ['2026-09-11'] }), personal), false);
    assert.equal(shouldUseOnboardingPlan(progress(), null), false);
  });
});

describe('getTodayDailyPlan', () => {
  it('uses the personal mix before the first daily is done', () => {
    const plan = getTodayDailyPlan('2026-09-14', progress(), personal);
    assert.equal(plan.title, personal.title);
    assert.deepEqual(plan.games, personal.recommendedGames);
  });

  it('returns the weekday theme after the first daily completes', () => {
    const plan = getTodayDailyPlan(
      '2026-09-14',
      progress({ dailyHistory: ['2026-09-11'], globalLevel: 3 }),
      personal
    );
    // 2026-09-14 is a Monday → Focus & Sequence (all games unlocked at Lv 3)
    assert.equal(plan.title, 'Focus & Sequence');
    assert.deepEqual(plan.games, ['focus_flash', 'pattern_garden', 'color_switch']);
  });

  it('keeps weekday themes when no personal plan is stored', () => {
    const plan = getTodayDailyPlan('2026-09-14', progress(), null);
    assert.equal(plan.title, 'Focus & Sequence');
  });
});
