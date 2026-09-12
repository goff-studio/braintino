import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { PersonalPlan } from '@/types/plan';

/**
 * Clever-lite personalization onboarding (issue #5).
 *
 * Exact names + payload fields (also in /docs/onboarding-analytics.md):
 *
 * onboarding_step_viewed
 *   step: string            welcome | goal | age | weak_spots | time | reminder | plan
 *   step_index: number      0-based
 *
 * plan_generated
 *   goal: string
 *   age_band: string
 *   weak_spots: string      comma-separated ids
 *   weak_spot_count: number
 *   time_minutes: number
 *   difficulty_mode: string
 *   plan_title: string
 *
 * onboarding_completed
 *   next: string            calibration | first_session | assessment | today
 *   goal: string
 *   age_band: string
 *   difficulty_mode: string
 *   reminder_enabled: boolean
 *
 * No medical / diagnostic properties.
 */

export const ONBOARDING_STEPS = [
  'welcome',
  'goal',
  'age',
  'weak_spots',
  'time',
  'reminder',
  'plan',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export type OnboardingNext = 'calibration' | 'first_session' | 'assessment' | 'today';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

export function trackOnboardingStepViewed(step: OnboardingStepId, stepIndex: number): void {
  emit('onboarding_step_viewed', {
    step,
    step_index: stepIndex,
  });
}

export function trackPlanGenerated(plan: PersonalPlan): void {
  emit('plan_generated', {
    goal: plan.goal,
    age_band: plan.ageBand,
    weak_spots: plan.weakSpots.join(','),
    weak_spot_count: plan.weakSpots.length,
    time_minutes: plan.timeMinutes,
    difficulty_mode: plan.difficultyMode,
    plan_title: plan.title,
  });
}

export function trackOnboardingCompleted(args: {
  next: OnboardingNext;
  plan: PersonalPlan;
  reminderEnabled: boolean;
}): void {
  emit('onboarding_completed', {
    next: args.next,
    goal: args.plan.goal,
    age_band: args.plan.ageBand,
    difficulty_mode: args.plan.difficultyMode,
    reminder_enabled: args.reminderEnabled,
  });
}
