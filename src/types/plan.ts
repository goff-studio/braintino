import type { MiniGameId } from '@/types/game';

/** What the player wants to practice — entertainment goals, not diagnoses. */
export type PlanGoal = 'focus' | 'memory' | 'speed' | 'flexibility' | 'habit';

export type PlanAgeBand = 'under_25' | '25_34' | '35_49' | '50_plus' | 'prefer_not';

/** Self-reported practice preferences. Never treat as clinical symptoms. */
export type PlanWeakSpot = 'focus' | 'memory' | 'speed' | 'switching' | 'everyday';

/** Daily session length. Clever-lite commits to the existing 5-minute loop. */
export type PlanTimeMinutes = 5;

export const PLAN_GOALS = ['focus', 'memory', 'speed', 'flexibility', 'habit'] as const;
export const PLAN_AGE_BANDS = ['under_25', '25_34', '35_49', '50_plus', 'prefer_not'] as const;
export const PLAN_WEAK_SPOTS = ['focus', 'memory', 'speed', 'switching', 'everyday'] as const;

export type PersonalPlanAnswers = {
  goal: PlanGoal;
  ageBand: PlanAgeBand;
  weakSpots: PlanWeakSpot[];
  timeMinutes: PlanTimeMinutes;
};

/**
 * Generated 5-minute practice mix. Copy and games are for fun / self-insight
 * only — never imply a medical or diagnostic result.
 */
export type PersonalPlan = PersonalPlanAnswers & {
  title: string;
  focusCopy: string;
  difficultyMode: 'relaxed' | 'balanced' | 'challenging';
  recommendedGames: [MiniGameId, MiniGameId, MiniGameId];
};

export const PLAN_DISCLAIMER =
  'For entertainment and self-insight only. Not a medical, diagnostic, or clinical assessment.';
