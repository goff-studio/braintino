import { gameConfig } from '@/constants/gameConfig';
import { calculateAccuracy, calculateConsistency } from '@/game/engines/scoring';
import type { AssessmentBand, AssessmentResult, AssessmentSource } from '@/types/assessment';
import { ASSESSMENT_SOURCES } from '@/types/assessment';
import type { RoundsSummary } from '@/types/game';
import { clamp, median } from '@/utils/math';

export const ASSESSMENT_ID = gameConfig.assessment.id;

/**
 * Shown on intro, results, and the share card. Assessments are
 * entertainment / self-insight only — never invent medical claims.
 */
export const ASSESSMENT_DISCLAIMER =
  'For entertainment and self-insight only. Not a medical, diagnostic, or clinical test — and not a measure of IQ, ADHD, or any health condition.';

export function parseAssessmentSource(value: unknown): AssessmentSource {
  if (typeof value === 'string' && (ASSESSMENT_SOURCES as readonly string[]).includes(value)) {
    return value as AssessmentSource;
  }
  return 'deeplink';
}

/** Playful labels only. Do not map these to diagnoses or ability claims. */
export function assessmentBand(score: number): AssessmentBand {
  if (score >= 85) return { label: 'Lightning snapshot', blurb: 'Quick and accurate on this run.' };
  if (score >= 70) return { label: 'Sharp snapshot', blurb: 'Clean attention on this short run.' };
  if (score >= 55) return { label: 'Steady snapshot', blurb: 'A solid, even pace this time.' };
  return { label: 'Warming up', blurb: 'A starting point — try another run anytime.' };
}

/**
 * Speed score from median RT. ~400ms → 100, ~2200ms → 0.
 * FocusFlash answers typically land in the 800–2000ms range.
 */
export function speedFromReactionTime(medianMs: number | undefined, accuracy: number): number {
  if (medianMs === undefined) return accuracy;
  return clamp(1 - (medianMs - 400) / 1800, 0, 1);
}

/**
 * Entertainment-only snapshot: focus ≈ cue accuracy, speed ≈ median RT,
 * consistency ≈ existing MAD-based steadiness. Weighted into one 0–100 score.
 */
export function scoreAssessment(
  summary: RoundsSummary,
  durationSec: number,
  source: AssessmentSource
): AssessmentResult {
  const accuracy = calculateAccuracy(summary.correct, summary.total);
  const consistency01 = calculateConsistency(summary.reactionTimesMs, accuracy);
  const med = median(summary.reactionTimesMs);
  const speed01 = speedFromReactionTime(med, accuracy);

  const focus = Math.round(accuracy * 100);
  const speed = Math.round(speed01 * 100);
  const consistency = Math.round(consistency01 * 100);
  const score = Math.round(focus * 0.4 + speed * 0.35 + consistency * 0.25);

  return {
    id: ASSESSMENT_ID,
    score,
    focus,
    speed,
    consistency,
    accuracy,
    reactionTimeMedian: med,
    completedRounds: summary.completedRounds,
    mistakes: summary.mistakes,
    durationSec: Math.max(1, Math.round(durationSec)),
    completedAt: new Date().toISOString(),
    source,
    band: assessmentBand(score),
  };
}

export function shareMessage(result: AssessmentResult): string {
  return `I scored ${result.score}/100 on Braintino's Focus Snapshot. Entertainment only — not a diagnosis.`;
}
