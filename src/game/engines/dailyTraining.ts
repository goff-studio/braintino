import { WEEKDAY_THEMES } from '@/data/dailyPlans';
import { MINI_GAME_IDS, MINI_GAMES } from '@/data/miniGames';
import type { MiniGameId } from '@/types/game';
import type { PersonalPlan } from '@/types/plan';
import type { PlayerProgress } from '@/types/progress';
import { daysAgoKey, weekdayFromKey } from '@/utils/date';
import { rngFromString, shuffle } from '@/utils/random';

export type DailyPlan = {
  dateKey: string;
  title: string;
  games: MiniGameId[];
};

function unlockedGames(progress: PlayerProgress): MiniGameId[] {
  return MINI_GAME_IDS.filter((id) => MINI_GAMES[id].unlockLevel <= progress.globalLevel);
}

/** First daily uses the onboarding mix so Today matches the generated plan. */
export function shouldUseOnboardingPlan(
  progress: PlayerProgress,
  personalPlan?: PersonalPlan | null
): personalPlan is PersonalPlan {
  return Boolean(personalPlan && progress.dailyHistory.length === 0);
}

/**
 * Deterministic plan for a given date: the same day always returns the same
 * plan, tomorrow's differs, and yesterday's exact set is never repeated.
 * Focus Flash appears often because it is the core game.
 *
 * Before the first daily completion, a stored personal plan replaces the
 * weekday mix so onboarding → Today shows the same three exercises.
 */
export function getTodayDailyPlan(
  dateKey: string,
  progress: PlayerProgress,
  personalPlan?: PersonalPlan | null
): DailyPlan {
  if (shouldUseOnboardingPlan(progress, personalPlan)) {
    return {
      dateKey,
      title: personalPlan.title,
      games: [...personalPlan.recommendedGames],
    };
  }
  const weekday = weekdayFromKey(dateKey);
  const theme = WEEKDAY_THEMES[weekday];
  const unlocked = unlockedGames(progress);

  let games: MiniGameId[] = theme.games.filter((id) => unlocked.includes(id));

  // Weekend Boost gets a seeded shuffle for variety while staying deterministic.
  if (weekday === 0 || weekday === 6) {
    const rng = rngFromString(`daily-${dateKey}`);
    const pool = shuffle(rng, unlocked.filter((id) => id !== 'focus_flash'));
    games = ['focus_flash', ...pool.slice(0, 2)];
  }

  // Top up with unlocked games if early-progress locks trimmed the set.
  for (const id of unlocked) {
    if (games.length >= 3) break;
    if (!games.includes(id)) games.push(id);
  }

  // Never repeat yesterday's exact set in the same order.
  const yesterday = getRawPlanGames(daysAgoKey(1), unlocked);
  if (games.length === 3 && games.join() === yesterday.join()) {
    games = [games[0], games[2], games[1]];
  }

  return { dateKey, title: theme.title, games: games.slice(0, 3) };
}

function getRawPlanGames(dateKey: string, unlocked: MiniGameId[]): MiniGameId[] {
  const weekday = weekdayFromKey(dateKey);
  const theme = WEEKDAY_THEMES[weekday];
  if (weekday === 0 || weekday === 6) {
    const rng = rngFromString(`daily-${dateKey}`);
    const pool = shuffle(rng, unlocked.filter((id) => id !== 'focus_flash'));
    return ['focus_flash', ...pool.slice(0, 2)];
  }
  return theme.games.filter((id) => unlocked.includes(id));
}
