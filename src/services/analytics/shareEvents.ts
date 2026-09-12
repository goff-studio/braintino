import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { AssessmentResult } from '@/types/assessment';
import type { ShareMethod } from '@/services/analytics/assessmentEvents';

/**
 * Share + invite loop events (issue #7).
 *
 * Exact names + payload fields (also in /docs/invite-share.md):
 *
 * share_initiated
 *   share_kind: string      'result' | 'invite' | 'streak'
 *   surface: string         'assessment_result' | 'session_results' | 'progress'
 *   platform: string        'ios' | 'android' | 'web'
 *   assessment_id?: string
 *   score?: number
 *   streak?: number
 *
 * share_completed
 *   same as initiated, plus
 *   share_method: string    'image' | 'fallback_text'
 *   activity_type?: string  iOS share-sheet activity, when the OS reports it
 *
 * invite_tapped
 *   surface, platform, optional assessment_id / score / streak
 *
 * `result_shared` (issue #2 / #11) still fires when the Focus Snapshot card
 * is shared from the result screen. Do not invent medical / diagnostic properties.
 */

export type ShareKind = 'result' | 'invite' | 'streak';
export type ShareSurface = 'assessment_result' | 'session_results' | 'progress';

export type ShareEventArgs = {
  surface: ShareSurface;
  platform: string;
  kind?: ShareKind;
  result?: AssessmentResult | null;
  streakDays?: number;
};

function emit(name: string, params: Record<string, string | number | boolean>): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

function baseParams(args: ShareEventArgs): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    surface: args.surface,
    platform: args.platform,
  };
  if (args.kind) params.share_kind = args.kind;
  if (args.result) {
    params.assessment_id = args.result.id;
    params.score = args.result.score;
  }
  if (args.streakDays !== undefined) params.streak = args.streakDays;
  return params;
}

export function trackShareInitiated(args: ShareEventArgs & { kind: ShareKind }): void {
  emit('share_initiated', baseParams(args));
}

export function trackShareCompleted(
  args: ShareEventArgs & {
    kind: ShareKind;
    shareMethod: ShareMethod;
    activityType?: string;
  }
): void {
  const params: Record<string, string | number | boolean> = {
    ...baseParams(args),
    share_method: args.shareMethod,
  };
  if (args.activityType) {
    params.activity_type = args.activityType.slice(0, 100);
  }
  emit('share_completed', params);
}

export function trackInviteTapped(args: ShareEventArgs): void {
  emit('invite_tapped', baseParams(args));
}
