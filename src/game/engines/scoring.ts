import { gameConfig } from '@/constants/gameConfig';
import type { MiniGameId, MiniGameResult, RoundsSummary, SkillType } from '@/types/game';
import { clamp, mad, median } from '@/utils/math';

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return clamp(correct / total, 0, 1);
}

/** Internal 1–3 session rating; no longer the primary reward surface. */
export function calculateStars(accuracy: number, completed: boolean): 1 | 2 | 3 {
  if (completed && accuracy >= gameConfig.stars.three) return 3;
  if (completed && accuracy >= gameConfig.stars.two) return 2;
  return 1;
}

export function calculateXP(summary: RoundsSummary, accuracy: number): number {
  const { perRound, accuracyMax, speedBonusMax } = gameConfig.xp;
  const med = median(summary.reactionTimesMs);
  // Small speed bonus only — accuracy should always matter more.
  const speedBonus = med !== undefined ? Math.round(clamp(1 - med / 3000, 0, 1) * speedBonusMax) : 0;
  return summary.completedRounds * perRound + Math.round(accuracy * accuracyMax) + speedBonus;
}

/**
 * Response-time steadiness on 0..1, from the robust coefficient of variation
 * (MAD/median). Falls back to accuracy when too few times were recorded.
 */
export function calculateConsistency(reactionTimesMs: number[], accuracy: number): number {
  if (reactionTimesMs.length < 4) return accuracy;
  const med = median(reactionTimesMs);
  const spread = mad(reactionTimesMs);
  if (med === undefined || spread === undefined || med <= 0) return accuracy;
  return clamp(1 - (1.4826 * spread) / med, 0, 1);
}

export function consistencyLabel(consistency: number): string {
  if (consistency >= 0.8) return 'Stable';
  if (consistency >= 0.6) return 'Steady';
  return 'Variable';
}

/**
 * Practice Score (0–100): an in-app practice metric combining accuracy,
 * response consistency, completion, and difficulty. Not a health measure.
 */
export function calculatePracticeScore(
  accuracy: number,
  consistency: number,
  completionRate: number,
  level: number
): number {
  const w = gameConfig.practiceScore;
  const difficultyNormalized = clamp(level / gameConfig.adaptive.maxLevel, 0, 1);
  return Math.round(
    100 *
      (accuracy * w.accuracy +
        consistency * w.consistency +
        completionRate * w.completion +
        difficultyNormalized * w.difficulty)
  );
}

/** Which skills each mini-game trains, with a weight per skill. */
const SKILL_WEIGHTS: Record<MiniGameId, Partial<Record<SkillType, number>>> = {
  focus_flash: { speed: 0.5, attention: 0.5 },
  route_recall: { navigation: 0.7, memory: 0.3 },
  pattern_garden: { memory: 0.8, attention: 0.2 },
  color_switch: { inhibition: 0.7, attention: 0.3 },
  signal_shift: { flexibility: 0.7, speed: 0.3 },
  market_memory: { memory: 0.6, attention: 0.4 },
};

export function calculateSkillScores(
  miniGameId: MiniGameId,
  accuracy: number
): Partial<Record<SkillType, number>> {
  const weights = SKILL_WEIGHTS[miniGameId];
  const scores: Partial<Record<SkillType, number>> = {};
  for (const [skill, weight] of Object.entries(weights) as [SkillType, number][]) {
    scores[skill] = Math.round(accuracy * weight * 100);
  }
  return scores;
}

export function createFriendlyFeedback(result: MiniGameResult): string {
  if (result.completed && result.accuracy >= gameConfig.stars.three) {
    const messages: Record<MiniGameId, string> = {
      focus_flash: 'Fast and accurate — strong processing speed.',
      route_recall: 'Flawless route. Strong spatial memory.',
      pattern_garden: 'Full sequence recalled. Excellent working memory.',
      color_switch: 'Excellent control under interference.',
      signal_shift: 'You adapted cleanly to every rule change.',
      market_memory: 'Precise recall — every item, nothing extra.',
    };
    return messages[result.miniGameId];
  }
  if (result.completed && result.accuracy >= gameConfig.stars.two) {
    return 'Strong accuracy. Keep this pace.';
  }
  if (result.accuracy < gameConfig.adaptive.softFloor) {
    return 'A demanding session. Difficulty is adjusting — accuracy comes first.';
  }
  if (result.completed) return 'Solid session. Consistency builds results.';
  return 'Session logged. Progress saved.';
}

/** Builds a full scored result from a mini-game's raw round summary. */
export function buildResult(
  miniGameId: MiniGameId,
  level: number,
  summary: RoundsSummary
): MiniGameResult {
  const accuracy = calculateAccuracy(summary.correct, summary.total);
  const consistency = calculateConsistency(summary.reactionTimesMs, accuracy);
  const totalRounds = gameConfig.roundsPerSession[miniGameId] ?? summary.completedRounds;
  const completionRate = clamp(totalRounds > 0 ? summary.completedRounds / totalRounds : 0, 0, 1);
  return {
    miniGameId,
    level,
    accuracy,
    reactionTimeMedian: median(summary.reactionTimesMs),
    completedRounds: summary.completedRounds,
    mistakes: summary.mistakes,
    consistency,
    completionRate,
    practiceScore: calculatePracticeScore(accuracy, consistency, completionRate, level),
    stars: calculateStars(accuracy, summary.completed),
    xp: calculateXP(summary, accuracy),
    skillScores: calculateSkillScores(miniGameId, accuracy),
    completed: summary.completed,
  };
}
