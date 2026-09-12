import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import type { MiniGameId } from '@/types/game';

/**
 * Free-play unlock (issue #6).
 *
 * After onboarding — or after the first completed daily — Practice is free
 * play on every game the player has unlocked. Completing the first daily
 * also opens the full six-engine catalog so the library does not stay
 * half-empty at global level 1.
 *
 * Daily plans still use unlockLevel (see dailyTraining). Adaptive scoring
 * is unchanged.
 */

export type FreePlayUnlockArgs = {
  onboardingDone: boolean;
  lastDailyCompletedDate?: string;
  globalLevel: number;
};

export function isFreePlayUnlocked(args: Pick<FreePlayUnlockArgs, 'onboardingDone' | 'lastDailyCompletedDate'>): boolean {
  return args.onboardingDone || Boolean(args.lastDailyCompletedDate);
}

/** True once the first daily session has been completed (catalog opens). */
export function isCatalogOpen(lastDailyCompletedDate?: string): boolean {
  return Boolean(lastDailyCompletedDate);
}

export function isFreePlayGameUnlocked(unlockLevel: number, args: FreePlayUnlockArgs): boolean {
  if (!isFreePlayUnlocked(args)) return false;
  if (isCatalogOpen(args.lastDailyCompletedDate)) return true;
  return unlockLevel <= args.globalLevel;
}

export function unlockedFreePlayGames(args: FreePlayUnlockArgs): MiniGameId[] {
  return MINI_GAME_IDS.filter((id) => isFreePlayGameUnlocked(MINI_GAMES[id].unlockLevel, args));
}

export function freePlayLockHint(unlockLevel: number, args: FreePlayUnlockArgs): string | undefined {
  if (isFreePlayGameUnlocked(unlockLevel, args)) return undefined;
  if (!isFreePlayUnlocked(args)) return 'Finish onboarding to unlock';
  if (!isCatalogOpen(args.lastDailyCompletedDate) && unlockLevel > args.globalLevel) {
    return 'Finish today’s session to unlock';
  }
  return `Level ${unlockLevel} to unlock`;
}
