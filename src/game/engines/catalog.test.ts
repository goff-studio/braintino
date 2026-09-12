import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import {
  freePlayLockHint,
  isCatalogOpen,
  isFreePlayGameUnlocked,
  isFreePlayUnlocked,
  unlockedFreePlayGames,
} from '@/game/engines/catalog';

describe('free-play unlock', () => {
  it('stays closed until onboarding or a completed daily', () => {
    assert.equal(isFreePlayUnlocked({ onboardingDone: false }), false);
    assert.equal(isFreePlayUnlocked({ onboardingDone: true }), true);
    assert.equal(
      isFreePlayUnlocked({ onboardingDone: false, lastDailyCompletedDate: '2026-09-12' }),
      true
    );
  });

  it('respects unlockLevel after onboarding until the first daily', () => {
    const args = { onboardingDone: true, globalLevel: 1 };
    assert.equal(isFreePlayGameUnlocked(1, args), true);
    assert.equal(isFreePlayGameUnlocked(2, args), false);
    assert.equal(isFreePlayGameUnlocked(3, args), false);
    assert.deepEqual(
      unlockedFreePlayGames(args),
      MINI_GAME_IDS.filter((id) => MINI_GAMES[id].unlockLevel <= 1)
    );
  });

  it('opens the full catalog after the first daily', () => {
    const args = {
      onboardingDone: true,
      globalLevel: 1,
      lastDailyCompletedDate: '2026-09-12',
    };
    assert.equal(isCatalogOpen(args.lastDailyCompletedDate), true);
    for (const id of MINI_GAME_IDS) {
      assert.equal(isFreePlayGameUnlocked(MINI_GAMES[id].unlockLevel, args), true);
    }
    assert.equal(unlockedFreePlayGames(args).length, 6);
  });

  it('points locked games at today’s session before the catalog opens', () => {
    assert.equal(
      freePlayLockHint(2, { onboardingDone: true, globalLevel: 1 }),
      'Finish today’s session to unlock'
    );
    assert.equal(
      freePlayLockHint(1, { onboardingDone: false, globalLevel: 1 }),
      'Finish onboarding to unlock'
    );
  });
});
