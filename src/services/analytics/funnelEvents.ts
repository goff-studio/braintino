import { trackEvent } from '@/services/analytics/analytics';
import { getTrafficSource } from '@/services/analytics/trafficSource';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { SessionMode } from '@/types/game';
import type { DifficultyMode } from '@/types/settings';

/**
 * Organic DAU funnel events that were not already owned by assessment / habit /
 * rating modules (issue #11). Exact names + payloads: docs/kpi-funnel.md.
 *
 * onboarding_completed
 *   mode: string            'relaxed' | 'balanced' | 'challenging'
 *   next: string            'calibration' | 'assessment' | 'home'
 *   reminder_enabled: bool
 *   traffic_source: string  'organic' | 'paid'
 *
 * first_session
 *   mode: string            'daily' | 'practice' | 'weekly'
 *   traffic_source: string
 *
 * Install is Firebase `first_open` + AppsFlyer install (not duplicated here).
 * Do not invent medical / diagnostic properties.
 */

export type OnboardingExit = 'calibration' | 'assessment' | 'home';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  const payload = { ...params, traffic_source: getTrafficSource() };
  void trackEvent(name, payload);
  AppsFlyerService.logEvent(name, payload);
}

export function trackOnboardingCompleted(args: {
  mode: DifficultyMode;
  next: OnboardingExit;
  reminderEnabled: boolean;
}): void {
  emit('onboarding_completed', {
    mode: args.mode,
    next: args.next,
    reminder_enabled: args.reminderEnabled,
  });
}

export function trackFirstSession(args: { mode: SessionMode }): void {
  emit('first_session', { mode: args.mode });
}
