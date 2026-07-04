import type { MiniGameId } from '@/types/game';

export type DailyTheme = {
  title: string;
  games: [MiniGameId, MiniGameId, MiniGameId];
};

/** Weekday themes, indexed by JS getDay() (0 = Sunday). Focus Flash appears often — it is the core game. */
export const WEEKDAY_THEMES: Record<number, DailyTheme> = {
  1: { title: 'Mindful Monday', games: ['focus_flash', 'pattern_garden', 'color_switch'] },
  2: { title: 'Trail Tuesday', games: ['route_recall', 'market_memory', 'focus_flash'] },
  3: { title: 'Bright Wednesday', games: ['color_switch', 'signal_shift', 'pattern_garden'] },
  4: { title: 'Memory Thursday', games: ['market_memory', 'pattern_garden', 'route_recall'] },
  5: { title: 'Focus Friday', games: ['focus_flash', 'signal_shift', 'color_switch'] },
  // Weekend Boost sets are picked deterministically per date in the daily engine.
  0: { title: 'Weekend Boost', games: ['focus_flash', 'route_recall', 'market_memory'] },
  6: { title: 'Weekend Boost', games: ['focus_flash', 'pattern_garden', 'signal_shift'] },
};
