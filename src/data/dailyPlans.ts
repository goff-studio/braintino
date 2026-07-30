import type { MiniGameId } from '@/types/game';

export type DailyTheme = {
  title: string;
  games: [MiniGameId, MiniGameId, MiniGameId];
};

/** Weekday themes, indexed by JS getDay() (0 = Sunday). Processing Speed appears often — it is the core exercise. */
export const WEEKDAY_THEMES: Record<number, DailyTheme> = {
  1: { title: 'Focus & Sequence', games: ['focus_flash', 'pattern_garden', 'color_switch'] },
  2: { title: 'Routes & Recall', games: ['route_recall', 'market_memory', 'focus_flash'] },
  3: { title: 'Control & Flexibility', games: ['color_switch', 'signal_shift', 'pattern_garden'] },
  4: { title: 'Memory Emphasis', games: ['market_memory', 'pattern_garden', 'route_recall'] },
  5: { title: 'Speed & Control', games: ['focus_flash', 'signal_shift', 'color_switch'] },
  // Mixed Practice sets are picked deterministically per date in the daily engine.
  0: { title: 'Mixed Practice', games: ['focus_flash', 'route_recall', 'market_memory'] },
  6: { title: 'Mixed Practice', games: ['focus_flash', 'pattern_garden', 'signal_shift'] },
};
