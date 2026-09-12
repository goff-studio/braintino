import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { MiniGameId, WeeklyTwistId } from '@/types/game';

/**
 * Free-play + weekly challenge events (issue #6).
 *
 * Exact names + payload fields (also in /docs/catalog-analytics.md):
 *
 * free_play_started
 *   game_id: string         MiniGameId
 *   source: string          'today' | 'practice' | 'results'
 *
 * weekly_challenge_started
 *   week_key: string        Monday YYYY-MM-DD
 *   title: string
 *   twist: string           'switch' | 'reverse' | 'dual' | 'everyday'
 *
 * weekly_challenge_completed
 *   week_key: string
 *   title: string
 *   twist: string
 *   avg_accuracy: number    0–1
 *   total_sessions: number
 *
 * Practice / entertainment only — no medical / diagnostic properties.
 */

export type FreePlaySource = 'today' | 'practice' | 'results';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

export function trackFreePlayStarted(args: { gameId: MiniGameId; source: FreePlaySource }): void {
  emit('free_play_started', {
    game_id: args.gameId,
    source: args.source,
  });
}

export function trackWeeklyChallengeStarted(args: {
  weekKey: string;
  title: string;
  twist: WeeklyTwistId;
}): void {
  emit('weekly_challenge_started', {
    week_key: args.weekKey,
    title: args.title,
    twist: args.twist,
  });
}

export function trackWeeklyChallengeCompleted(args: {
  weekKey: string;
  title: string;
  twist: WeeklyTwistId;
  avgAccuracy: number;
  totalSessions: number;
}): void {
  emit('weekly_challenge_completed', {
    week_key: args.weekKey,
    title: args.title,
    twist: args.twist,
    avg_accuracy: Number(args.avgAccuracy.toFixed(3)),
    total_sessions: args.totalSessions,
  });
}
