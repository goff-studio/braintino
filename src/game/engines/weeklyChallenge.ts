import { WEEKLY_CHALLENGE_THEMES, type WeeklyChallengeTheme } from '@/data/weeklyChallenges';
import type { DifficultyConfig, MiniGameId, WeeklyTwistId } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';
import { daysUntilNextWeek, weekIndexFromKey, weekStartKey } from '@/utils/date';
import { unlockedFreePlayGames, type FreePlayUnlockArgs } from './catalog';

export type WeeklyChallengePlan = {
  weekKey: string;
  title: string;
  blurb: string;
  twist: WeeklyTwistId;
  games: MiniGameId[];
  completed: boolean;
  daysLeft: number;
};

function themeForWeek(weekKey: string): WeeklyChallengeTheme {
  const index = Math.abs(weekIndexFromKey(weekKey)) % WEEKLY_CHALLENGE_THEMES.length;
  return WEEKLY_CHALLENGE_THEMES[index];
}

function fillPlan(preferred: MiniGameId[], pool: MiniGameId[]): MiniGameId[] {
  const games: MiniGameId[] = preferred.filter((id) => pool.includes(id));
  for (const id of pool) {
    if (games.length >= 3) break;
    if (!games.includes(id)) games.push(id);
  }
  for (const id of preferred) {
    if (games.length >= 3) break;
    if (!games.includes(id)) games.push(id);
  }
  return games.slice(0, 3);
}

/**
 * Deterministic weekly set for the Monday week of `from`.
 * Uses unlocked free-play games when the catalog is still gated; after the
 * first daily the themed three-engine mix is used as-is.
 */
export function getWeeklyChallengePlan(
  progress: PlayerProgress,
  unlock: FreePlayUnlockArgs,
  from: Date = new Date()
): WeeklyChallengePlan {
  const weekKey = weekStartKey(from);
  const theme = themeForWeek(weekKey);
  const pool = unlockedFreePlayGames(unlock);
  const games = fillPlan(theme.games, pool.length > 0 ? pool : [...theme.games]);
  const todayKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;

  return {
    weekKey,
    title: theme.title,
    blurb: theme.blurb,
    twist: theme.twist,
    games,
    completed: progress.lastWeeklyChallengeWeek === weekKey,
    daysLeft: daysUntilNextWeek(todayKey),
  };
}

/**
 * Overlay a weekly mode twist onto the player's current difficulty.
 * Does not change `level` — adaptive scoring stays on the stored level.
 */
export function applyWeeklyTwist(
  gameId: MiniGameId,
  config: DifficultyConfig,
  twist: WeeklyTwistId
): DifficultyConfig {
  const next: DifficultyConfig = { ...config };

  switch (twist) {
    case 'switch':
      if (gameId === 'color_switch' || gameId === 'signal_shift') {
        next.ruleSwitchFrequency = Math.max(3, (config.ruleSwitchFrequency ?? 6) - 1);
      }
      break;
    case 'reverse':
      if (gameId === 'pattern_garden') next.reverse = true;
      if (gameId === 'route_recall') next.rotateMap = true;
      if (gameId === 'market_memory' && (config.listMode ?? 'items') === 'items') {
        next.listMode = 'category';
      }
      break;
    case 'dual':
      if (gameId === 'focus_flash') next.focusRule = 'dual';
      if (gameId === 'color_switch') {
        next.conflictRate = Math.min(0.85, (config.conflictRate ?? 0.5) + 0.1);
      }
      break;
    case 'everyday':
      if (gameId === 'market_memory' && (config.listMode ?? 'items') === 'items') {
        next.listMode = 'category';
      }
      break;
  }

  return next;
}

export function weeklyTwistLabel(twist: WeeklyTwistId): string {
  switch (twist) {
    case 'switch':
      return 'Rules switch more often';
    case 'reverse':
      return 'Reverse & rotate';
    case 'dual':
      return 'Two cues at once';
    case 'everyday':
      return 'List, then act';
  }
}
