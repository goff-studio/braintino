import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generatePersonalPlan,
  parsePersonalPlan,
  pickRecommendedGames,
  seedDifficultyMode,
} from '@/game/engines/personalPlan';
import type { PersonalPlanAnswers } from '@/types/plan';

function answers(partial: Partial<PersonalPlanAnswers> = {}): PersonalPlanAnswers {
  return {
    goal: 'habit',
    ageBand: 'prefer_not',
    weakSpots: ['focus'],
    timeMinutes: 5,
    ...partial,
  };
}

describe('seedDifficultyMode', () => {
  it('uses a calmer pace for the 50+ band', () => {
    assert.equal(seedDifficultyMode(answers({ ageBand: '50_plus', goal: 'speed' })), 'relaxed');
  });

  it('uses a brisker pace for under-25 speed or focus goals', () => {
    assert.equal(seedDifficultyMode(answers({ ageBand: 'under_25', goal: 'speed' })), 'challenging');
    assert.equal(seedDifficultyMode(answers({ ageBand: 'under_25', goal: 'focus' })), 'challenging');
    assert.equal(seedDifficultyMode(answers({ ageBand: 'under_25', goal: 'habit' })), 'balanced');
  });

  it('defaults everyone else to balanced', () => {
    assert.equal(seedDifficultyMode(answers({ ageBand: '35_49', goal: 'memory' })), 'balanced');
    assert.equal(seedDifficultyMode(answers({ ageBand: 'prefer_not', goal: 'flexibility' })), 'balanced');
  });
});

describe('pickRecommendedGames', () => {
  it('returns three unique games', () => {
    const games = pickRecommendedGames(answers({ weakSpots: ['focus', 'memory', 'everyday'] }));
    assert.equal(games.length, 3);
    assert.equal(new Set(games).size, 3);
  });

  it('leans into flagged weak spots before the goal fallback', () => {
    const games = pickRecommendedGames(
      answers({ goal: 'habit', weakSpots: ['switching', 'everyday'] })
    );
    assert.equal(games[0], 'signal_shift');
    assert.ok(games.includes('market_memory') || games.includes('route_recall'));
  });

  it('still fills three games when no weak spots are set', () => {
    const games = pickRecommendedGames(answers({ goal: 'speed', weakSpots: [] }));
    assert.deepEqual(games, ['focus_flash', 'color_switch', 'signal_shift']);
  });
});

describe('generatePersonalPlan', () => {
  it('builds entertainment-only copy and a titled 5-minute mix', () => {
    const plan = generatePersonalPlan(
      answers({ goal: 'memory', ageBand: '50_plus', weakSpots: ['memory', 'everyday'] })
    );
    assert.equal(plan.timeMinutes, 5);
    assert.equal(plan.title, 'Memory Mix');
    assert.equal(plan.difficultyMode, 'relaxed');
    assert.match(plan.focusCopy, /self-insight/i);
    assert.match(plan.focusCopy, /not a medical or diagnostic test/i);
    assert.doesNotMatch(plan.focusCopy, /ADHD|\bIQ\b|treat|cure|prevent/i);
    assert.equal(plan.recommendedGames.length, 3);
  });

  it('dedupes weak spots and keeps goal/age answers', () => {
    const plan = generatePersonalPlan(
      answers({ goal: 'focus', weakSpots: ['focus', 'focus', 'speed'] })
    );
    assert.deepEqual(plan.weakSpots, ['focus', 'speed']);
    assert.equal(plan.goal, 'focus');
  });
});

describe('parsePersonalPlan', () => {
  it('returns null for missing or invalid payloads', () => {
    assert.equal(parsePersonalPlan(null), null);
    assert.equal(parsePersonalPlan({ goal: 'telepathy' }), null);
    assert.equal(parsePersonalPlan({ goal: 'habit', ageBand: '25_34', weakSpots: ['laser'] }), null);
  });

  it('rehydrates a stored plan and keeps a valid title/games tuple', () => {
    const stored = generatePersonalPlan(answers({ goal: 'speed', ageBand: 'under_25' }));
    const parsed = parsePersonalPlan({
      ...stored,
      title: 'Speed & Control',
    });
    assert.ok(parsed);
    assert.equal(parsed?.title, 'Speed & Control');
    assert.equal(parsed?.difficultyMode, 'challenging');
    assert.deepEqual(parsed?.recommendedGames, stored.recommendedGames);
  });

  it('regenerates from answers when stored games are incomplete', () => {
    const parsed = parsePersonalPlan({
      goal: 'flexibility',
      ageBand: '25_34',
      weakSpots: ['switching'],
      recommendedGames: ['signal_shift'],
    });
    assert.ok(parsed);
    assert.equal(parsed?.title, 'Flex & Switch');
    assert.equal(parsed?.recommendedGames.length, 3);
  });
});
