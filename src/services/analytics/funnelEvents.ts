import { trackEvent } from '@/services/analytics/analytics';
import { getTrafficSource } from '@/services/analytics/trafficSource';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { SessionMode } from '@/types/game';
import type { DifficultyMode } from '@/types/settings';

/**
 * Organic DAU funnel events that were not already owned by assessment / habit /
 * rating modules (issue #11), plus personalization fields from issue #5.
 * Exact names + payloads: docs/kpi-funnel.md and docs/onboarding-analytics.md.
 *
 * onboarding_completed
 *   mode: string            'relaxed' | 'balanced' | 'challenging'
 *   next: string            'calibration' | 'assessment' | 'home' | 'first_session' | 'today'
 *   reminder_enabled: bool
 *   traffic_source: string  'organic' | 'paid'
 *   goal?: string           personalization (issue #5)
 *   age_band?: string       personalization (issue #5)
 *
 * first_session
 *   mode: string            'daily' | 'practice' | 'weekly'
 *   traffic_source: string
 *
 * Install is Firebase `first_open` + AppsFlyer install (not duplicated here).
 * Do not invent medical / diagnostic properties.
 */

export type OnboardingExit =
  | 'calibration'
  | 'assessment'
  | 'home'
  | 'first_session'
  | 'today';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  const payload = { ...params, traffic_source: getTrafficSource() };
  void trackEvent(name, payload);
  AppsFlyerService.logEvent(name, payload);
}

export function trackOnboardingCompleted(args: {
  mode: DifficultyMode;
  next: OnboardingExit;
  reminderEnabled: boolean;
  goal?: string;
  ageBand?: string;
}): void {
  const payload: Record<string, string | number | boolean> = {
    mode: args.mode,
    next: args.next,
    reminder_enabled: args.reminderEnabled,
  };
  if (args.goal) payload.goal = args.goal;
  if (args.ageBand) payload.age_band = args.ageBand;
  emit('onboarding_completed', payload);
}

export function trackFirstSession(args: { mode: SessionMode }): void {
  emit('first_session', { mode: args.mode });
}
