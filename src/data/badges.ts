import type { MiniGameResult } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';

export type BadgeContext = {
  /** Progress snapshot AFTER the result has been applied. */
  progress: PlayerProgress;
  result: MiniGameResult;
  sessionCompleted: boolean;
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  /** Ionicons name. */
  icon: string;
  earned: (ctx: BadgeContext) => boolean;
};

const TOTAL_EXERCISES = 6;

function highestExerciseLevel(progress: PlayerProgress): number {
  return Math.max(0, ...Object.values(progress.miniGameProgress).map((mg) => mg?.level ?? 0));
}

/** Milestone definitions — pure predicates re-checked after each completed exercise. */
export const BADGES: BadgeDef[] = [
  {
    id: 'first_session',
    title: 'First session',
    description: 'Completed your first practice session',
    icon: 'checkmark-circle-outline',
    earned: ({ progress }) => progress.totalSessions >= 1,
  },
  {
    id: 'streak_3',
    title: '3-day streak',
    description: 'Practiced three days in a row',
    icon: 'flame-outline',
    earned: ({ progress }) => progress.streak >= 3,
  },
  {
    id: 'streak_7',
    title: '7-day streak',
    description: 'Practiced a full week',
    icon: 'flame-outline',
    earned: ({ progress }) => progress.streak >= 7,
  },
  {
    id: 'streak_30',
    title: '30-day streak',
    description: 'A month of daily practice',
    icon: 'flame-outline',
    earned: ({ progress }) => progress.streak >= 30,
  },
  {
    id: 'sessions_25',
    title: '25 sessions',
    description: 'Completed 25 practice sessions',
    icon: 'checkmark-done-outline',
    earned: ({ progress }) => progress.totalSessions >= 25,
  },
  {
    id: 'sessions_100',
    title: '100 sessions',
    description: 'Completed 100 practice sessions',
    icon: 'checkmark-done-outline',
    earned: ({ progress }) => progress.totalSessions >= 100,
  },
  {
    id: 'advanced_tier',
    title: 'Advanced tier',
    description: 'Reached difficulty level 10 in an exercise',
    icon: 'trending-up',
    earned: ({ progress }) => highestExerciseLevel(progress) >= 10,
  },
  {
    id: 'expert_tier',
    title: 'Expert tier',
    description: 'Reached difficulty level 13 in an exercise',
    icon: 'ribbon-outline',
    earned: ({ progress }) => highestExerciseLevel(progress) >= 13,
  },
  {
    id: 'sharp_session',
    title: 'Sharp session',
    description: 'Scored 90+ in a single exercise',
    icon: 'flash-outline',
    earned: ({ result }) => result.practiceScore >= 90,
  },
  {
    id: 'full_circuit',
    title: 'Full circuit',
    description: 'Practiced all six exercises',
    icon: 'grid-outline',
    earned: ({ progress }) =>
      Object.values(progress.miniGameProgress).filter((mg) => (mg?.sessionsPlayed ?? 0) > 0)
        .length >= TOTAL_EXERCISES,
  },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Badges newly earned by this result (not yet recorded in progress). */
export function checkNewBadges(ctx: BadgeContext): BadgeDef[] {
  return BADGES.filter((b) => !ctx.progress.earnedBadges[b.id] && b.earned(ctx));
}
