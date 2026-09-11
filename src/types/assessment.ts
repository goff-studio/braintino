/** Organic-DAU funnel sources for the Focus Snapshot (issue #2 / #11). */
export type AssessmentSource = 'onboarding' | 'today' | 'practice' | 'deeplink';

export const ASSESSMENT_SOURCES: readonly AssessmentSource[] = [
  'onboarding',
  'today',
  'practice',
  'deeplink',
];

export type AssessmentId = 'focus_snapshot';

/** Playful entertainment band — never a clinical or IQ label. */
export type AssessmentBand = {
  label: string;
  blurb: string;
};

/**
 * One completed Focus Snapshot. Entertainment / self-insight only —
 * not a medical, diagnostic, IQ, or ADHD measure.
 */
export type AssessmentResult = {
  id: AssessmentId;
  /** 0–100 overall snapshot score. */
  score: number;
  /** 0–100 attention / cue accuracy. */
  focus: number;
  /** 0–100 response-speed score. */
  speed: number;
  /** 0–100 response-time steadiness. */
  consistency: number;
  /** 0–1 raw accuracy. */
  accuracy: number;
  reactionTimeMedian?: number;
  completedRounds: number;
  mistakes: number;
  durationSec: number;
  completedAt: string;
  source: AssessmentSource;
  band: AssessmentBand;
};
