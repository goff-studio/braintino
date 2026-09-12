import { GOAL_SHORT, GOAL_TITLE, WEAK_SPOT_SHORT } from '@/data/personalPlan';
import type { MiniGameId } from '@/types/game';
import {
  PLAN_AGE_BANDS,
  PLAN_GOALS,
  PLAN_WEAK_SPOTS,
  type PersonalPlan,
  type PersonalPlanAnswers,
  type PlanAgeBand,
  type PlanGoal,
  type PlanTimeMinutes,
  type PlanWeakSpot,
} from '@/types/plan';
import type { DifficultyMode } from '@/types/settings';

const MINI_GAME_IDS: MiniGameId[] = [
  'focus_flash',
  'route_recall',
  'pattern_garden',
  'color_switch',
  'signal_shift',
  'market_memory',
];

const GAMES_FOR_WEAK_SPOT: Record<PlanWeakSpot, MiniGameId[]> = {
  focus: ['color_switch', 'focus_flash'],
  memory: ['pattern_garden', 'market_memory'],
  speed: ['focus_flash', 'color_switch'],
  switching: ['signal_shift', 'color_switch'],
  everyday: ['market_memory', 'route_recall'],
};

const GAMES_FOR_GOAL: Record<PlanGoal, MiniGameId[]> = {
  focus: ['color_switch', 'focus_flash', 'signal_shift'],
  memory: ['pattern_garden', 'market_memory', 'route_recall'],
  speed: ['focus_flash', 'color_switch', 'signal_shift'],
  flexibility: ['signal_shift', 'color_switch', 'focus_flash'],
  habit: ['focus_flash', 'pattern_garden', 'market_memory'],
};

const FALLBACK_GAMES: MiniGameId[] = [
  'focus_flash',
  'pattern_garden',
  'color_switch',
  'market_memory',
  'route_recall',
  'signal_shift',
];

function isPlanGoal(value: unknown): value is PlanGoal {
  return typeof value === 'string' && (PLAN_GOALS as readonly string[]).includes(value);
}

function isPlanAgeBand(value: unknown): value is PlanAgeBand {
  return typeof value === 'string' && (PLAN_AGE_BANDS as readonly string[]).includes(value);
}

function isPlanWeakSpot(value: unknown): value is PlanWeakSpot {
  return typeof value === 'string' && (PLAN_WEAK_SPOTS as readonly string[]).includes(value);
}

function isMiniGameId(value: unknown): value is MiniGameId {
  return typeof value === 'string' && (MINI_GAME_IDS as readonly string[]).includes(value);
}

function uniqueSpots(spots: readonly PlanWeakSpot[]): PlanWeakSpot[] {
  return PLAN_WEAK_SPOTS.filter((spot) => spots.includes(spot));
}

function joinAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Seed starting pace from answers. Age is a comfort hint, not a deficit —
 * players can raise or lower it anytime in Profile.
 */
export function seedDifficultyMode(answers: PersonalPlanAnswers): DifficultyMode {
  if (answers.ageBand === '50_plus') return 'relaxed';
  if (answers.ageBand === 'under_25' && (answers.goal === 'speed' || answers.goal === 'focus')) {
    return 'challenging';
  }
  return 'balanced';
}

export function pickRecommendedGames(
  answers: PersonalPlanAnswers
): [MiniGameId, MiniGameId, MiniGameId] {
  const picked: MiniGameId[] = [];
  const add = (ids: readonly MiniGameId[]) => {
    for (const id of ids) {
      if (picked.length >= 3) return;
      if (!picked.includes(id)) picked.push(id);
    }
  };

  for (const spot of uniqueSpots(answers.weakSpots)) {
    add(GAMES_FOR_WEAK_SPOT[spot]);
  }
  add(GAMES_FOR_GOAL[answers.goal]);
  add(FALLBACK_GAMES);
  return [picked[0], picked[1], picked[2]];
}

export function planFocusCopy(answers: PersonalPlanAnswers): string {
  const spots = uniqueSpots(answers.weakSpots).map((spot) => WEAK_SPOT_SHORT[spot]);
  const lean = spots.length > 0 ? `leaning into ${joinAnd(spots)}` : `built around ${GOAL_SHORT[answers.goal]}`;
  return `Five minutes a day, ${lean}. For fun and self-insight — not a medical or diagnostic test.`;
}

export function generatePersonalPlan(answers: PersonalPlanAnswers): PersonalPlan {
  const weakSpots = uniqueSpots(answers.weakSpots);
  const timeMinutes: PlanTimeMinutes = 5;
  const normalized: PersonalPlanAnswers = {
    goal: answers.goal,
    ageBand: answers.ageBand,
    weakSpots,
    timeMinutes,
  };
  return {
    ...normalized,
    title: GOAL_TITLE[normalized.goal],
    focusCopy: planFocusCopy(normalized),
    difficultyMode: seedDifficultyMode(normalized),
    recommendedGames: pickRecommendedGames(normalized),
  };
}

/** Rehydrate a stored plan; returns null if answers are missing or invalid. */
export function parsePersonalPlan(value: unknown): PersonalPlan | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!isPlanGoal(raw.goal) || !isPlanAgeBand(raw.ageBand)) return null;
  if (!Array.isArray(raw.weakSpots) || !raw.weakSpots.every(isPlanWeakSpot)) return null;
  const answers: PersonalPlanAnswers = {
    goal: raw.goal,
    ageBand: raw.ageBand,
    weakSpots: raw.weakSpots,
    timeMinutes: 5,
  };
  const generated = generatePersonalPlan(answers);
  // Prefer stored title/games when they are still valid so Today stays stable.
  const games = Array.isArray(raw.recommendedGames) ? raw.recommendedGames.filter(isMiniGameId) : [];
  if (games.length === 3 && typeof raw.title === 'string' && raw.title.trim()) {
    return {
      ...generated,
      title: raw.title.trim(),
      recommendedGames: [games[0], games[1], games[2]],
      focusCopy: typeof raw.focusCopy === 'string' && raw.focusCopy.trim() ? raw.focusCopy : generated.focusCopy,
    };
  }
  return generated;
}
