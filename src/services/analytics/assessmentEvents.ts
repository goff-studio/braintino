import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { AssessmentResult, AssessmentSource } from '@/types/assessment';

/**
 * Focus Snapshot events — aligned with the organic DAU funnel (issue #11).
 *
 * Exact names + payload fields (also in /docs/assessment-analytics.md):
 *
 * assessment_started
 *   assessment_id: string   e.g. 'focus_snapshot'
 *   source: string          'onboarding' | 'today' | 'practice' | 'deeplink'
 *
 * assessment_completed
 *   assessment_id: string
 *   source: string
 *   score: number           0–100 overall
 *   focus: number           0–100
 *   speed: number           0–100
 *   consistency: number     0–100
 *   duration_sec: number
 *   rounds: number
 *
 * result_shared
 *   assessment_id: string
 *   score: number
 *   share_method: string    'image' | 'fallback_text'
 *
 * Do not invent medical / diagnostic properties. No KPI dashboard here.
 */

export type ShareMethod = 'image' | 'fallback_text';

function emit(name: string, params: Record<string, string | number | boolean>): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

export function trackAssessmentStarted(source: AssessmentSource, assessmentId: string): void {
  emit('assessment_started', {
    assessment_id: assessmentId,
    source,
  });
}

export function trackAssessmentCompleted(result: AssessmentResult): void {
  emit('assessment_completed', {
    assessment_id: result.id,
    source: result.source,
    score: result.score,
    focus: result.focus,
    speed: result.speed,
    consistency: result.consistency,
    duration_sec: result.durationSec,
    rounds: result.completedRounds,
  });
}

export function trackResultShared(
  result: AssessmentResult,
  shareMethod: ShareMethod
): void {
  emit('result_shared', {
    assessment_id: result.id,
    score: result.score,
    share_method: shareMethod,
  });
}
