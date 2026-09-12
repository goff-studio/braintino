import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { ReminderFrequency } from '@/types/settings';

/**
 * D1→D2 habit-loop events (issue #4).
 *
 * Exact names + payload fields (also in /docs/habit-loop-analytics.md):
 *
 * reminder_enabled
 *   source: string          'onboarding' | 'profile'
 *   frequency: string       'daily' | 'everyOtherDay' | 'weekdays'
 *   hour: number            24-hour clock
 *
 * daily_completed
 *   streak: number
 *   total_sessions: number
 *   plan_title: string
 *
 * d1_return
 *   days_since_first_open: number
 *   streak: number
 *   completed_daily_yesterday: boolean
 *
 * No medical / diagnostic properties.
 */

export type ReminderEnabledSource = 'onboarding' | 'profile';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

export function trackReminderEnabled(args: {
  source: ReminderEnabledSource;
  frequency: ReminderFrequency;
  hour: number;
}): void {
  emit('reminder_enabled', {
    source: args.source,
    frequency: args.frequency,
    hour: args.hour,
  });
}

export function trackDailyCompleted(args: {
  streak: number;
  totalSessions: number;
  planTitle: string;
}): void {
  emit('daily_completed', {
    streak: args.streak,
    total_sessions: args.totalSessions,
    plan_title: args.planTitle,
  });
}

export function trackD1Return(args: {
  daysSinceFirstOpen: number;
  streak: number;
  completedDailyYesterday: boolean;
}): void {
  emit('d1_return', {
    days_since_first_open: args.daysSinceFirstOpen,
    streak: args.streak,
    completed_daily_yesterday: args.completedDailyYesterday,
  });
}
