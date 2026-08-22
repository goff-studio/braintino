import { gameConfig } from '@/constants/gameConfig';
import type { RoundsSummary } from '@/types/game';
import type { DifficultyMode } from '@/types/settings';
import { clamp, median } from '@/utils/math';

/**
 * Onboarding calibration ("find your level"): a staircase over short bursts
 * of one exercise. Each burst plays at the current level; clean-and-fast
 * bursts jump the level, misses walk it back, and the run ends once the
 * climb stalls. The settled level seeds the player's starting point for
 * every exercise, replacing a week of +2 adaptive steps with ~90 seconds
 * of measurement.
 */

export type CalibrationOutcome = 'perfect' | 'solid' | 'hold' | 'fail';

export type CalibrationState = {
  /** Level the next burst plays at. */
  level: number;
  /** Highest level the player has handled (passed, or held steady at). */
  settledLevel: number;
  blocksPlayed: number;
  /** Bursts that didn't climb; gameConfig.calibration.maxStalls ends the run. */
  stalls: number;
  outcomes: CalibrationOutcome[];
  done: boolean;
};

export function createCalibration(mode: DifficultyMode): CalibrationState {
  const { baseline, floor } = gameConfig.modes[mode];
  return { level: baseline, settledLevel: floor, blocksPlayed: 0, stalls: 0, outcomes: [], done: false };
}

/**
 * Accuracy alone can't separate "good" from "way too easy" — everyone is
 * near-perfect at trivial levels — so the top outcome also requires the
 * median response time to beat the exercise's RT target.
 */
export function classifyCalibrationBlock(summary: RoundsSummary): CalibrationOutcome {
  const { thresholds, gameId } = gameConfig.calibration;
  const accuracy = summary.total > 0 ? summary.correct / summary.total : 0;
  const rt = median(summary.reactionTimesMs);
  const fast = rt !== undefined && rt <= gameConfig.rtTargets[gameId];
  if (accuracy >= thresholds.perfect && fast) return 'perfect';
  if (accuracy >= thresholds.solid) return 'solid';
  if (accuracy >= thresholds.hold) return 'hold';
  return 'fail';
}

export function advanceCalibration(state: CalibrationState, summary: RoundsSummary): CalibrationState {
  const { steps, maxStalls, maxBlocks } = gameConfig.calibration;
  const outcome = classifyCalibrationBlock(summary);
  const step =
    outcome === 'perfect' ? steps.perfect : outcome === 'solid' ? steps.solid : outcome === 'fail' ? steps.fail : 0;
  // A hold means the player is stable right here — a placement signal, not a
  // failure — but it still counts against the climb.
  const handled = outcome !== 'fail';
  const blocksPlayed = state.blocksPlayed + 1;
  const stalls = state.stalls + (step > 0 ? 0 : 1);
  return {
    level: clamp(state.level + step, 1, gameConfig.adaptive.maxLevel),
    settledLevel: handled ? Math.max(state.settledLevel, state.level) : state.settledLevel,
    blocksPlayed,
    stalls,
    outcomes: [...state.outcomes, outcome],
    done: stalls >= maxStalls || blocksPlayed >= maxBlocks,
  };
}

/** Final starting level: where the player settled, bounded by the mode floor and the onboarding cap. */
export function calibrationPlacement(state: CalibrationState, mode: DifficultyMode): number {
  return clamp(state.settledLevel, gameConfig.modes[mode].floor, gameConfig.calibration.maxPlacement);
}

/** Between-burst narration; adult and matter-of-fact, like difficultyChangeMessage. */
export function calibrationBlockMessage(outcome: CalibrationOutcome): string {
  switch (outcome) {
    case 'perfect':
      return 'Clean and fast — stepping up';
    case 'solid':
      return 'Accurate — nudging up';
    case 'hold':
      return 'Settling right around here';
    case 'fail':
      return 'Easing back a step';
  }
}
