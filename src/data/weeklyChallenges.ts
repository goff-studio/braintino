import type { MiniGameId, WeeklyTwistId } from '@/types/game';

export type WeeklyChallengeTheme = {
  twist: WeeklyTwistId;
  title: string;
  blurb: string;
  games: [MiniGameId, MiniGameId, MiniGameId];
};

/**
 * Four rotating weekly sets. Each is a mix of the existing six engines plus
 * a mode twist (rule-switch, reverse/rotate, dual-focus, everyday recall).
 * Indexed by weekIndexFromKey % length — deterministic, no new game code.
 */
export const WEEKLY_CHALLENGE_THEMES: WeeklyChallengeTheme[] = [
  {
    twist: 'switch',
    title: 'Switch Week',
    blurb: 'Rules flip more often. Notice the change, then adapt.',
    games: ['color_switch', 'signal_shift', 'focus_flash'],
  },
  {
    twist: 'reverse',
    title: 'Reverse Week',
    blurb: 'Sequences run backward and maps rotate after the preview.',
    games: ['pattern_garden', 'route_recall', 'market_memory'],
  },
  {
    twist: 'dual',
    title: 'Dual Focus',
    blurb: 'Track two cues at once. Accuracy still beats speed.',
    games: ['focus_flash', 'color_switch', 'signal_shift'],
  },
  {
    twist: 'everyday',
    title: 'Everyday Recall',
    blurb: 'Hold a short list, then act — a practical memory mix.',
    games: ['market_memory', 'route_recall', 'pattern_garden'],
  },
];
