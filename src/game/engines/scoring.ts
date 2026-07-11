import { gameConfig } from '@/constants/gameConfig';
import type { MiniGameId, MiniGameResult, RoundsSummary, SkillType } from '@/types/game';
import { clamp, median } from '@/utils/math';

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return clamp(correct / total, 0, 1);
}

export function calculateStars(accuracy: number, completed: boolean): 1 | 2 | 3 {
  if (completed && accuracy >= gameConfig.stars.three) return 3;
  if (completed && accuracy >= gameConfig.stars.two) return 2;
  return 1;
}

export function calculateXP(summary: RoundsSummary, accuracy: number, stars: number): number {
  const { perRound, perStar, accuracyMax, speedBonusMax } = gameConfig.xp;
  const med = median(summary.reactionTimesMs);
  // Small speed bonus only — accuracy should always matter more.
  const speedBonus = med !== undefined ? Math.round(clamp(1 - med / 3000, 0, 1) * speedBonusMax) : 0;
  return summary.completedRounds * perRound + stars * perStar + Math.round(accuracy * accuracyMax) + speedBonus;
}

export function calculateCoins(stars: number, streak: number): number {
  const streakBonus = Math.min(gameConfig.coins.streakBonusMax, streak);
  return stars * gameConfig.coins.perStar + streakBonus;
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
  if (result.stars === 3) {
    const messages: Record<MiniGameId, string> = {
      focus_flash: 'Great focus — you caught every flash!',
      route_recall: 'You remembered the route beautifully.',
      pattern_garden: 'Nice recall — the garden is glowing.',
      color_switch: 'Steady control. The colors couldn’t trick you.',
      signal_shift: 'Wonderfully flexible sorting!',
      market_memory: 'Tino’s basket is perfectly packed.',
    };
    return messages[result.miniGameId];
  }
  if (result.stars === 2) return 'Nice work — that was steady.';
  if (result.completed) return 'Good effort. Short and steady wins.';
  return 'A good warm-up! Tino saved your progress.';
}

/** Builds a full scored result from a mini-game's raw round summary. */
export function buildResult(
  miniGameId: MiniGameId,
  level: number,
  summary: RoundsSummary,
  streak: number
): MiniGameResult {
  const accuracy = calculateAccuracy(summary.correct, summary.total);
  const stars = calculateStars(accuracy, summary.completed);
  return {
    miniGameId,
    level,
    accuracy,
    reactionTimeMedian: median(summary.reactionTimesMs),
    completedRounds: summary.completedRounds,
    mistakes: summary.mistakes,
    stars,
    xp: calculateXP(summary, accuracy, stars),
    coins: calculateCoins(stars, streak),
    skillScores: calculateSkillScores(miniGameId, accuracy),
    completed: summary.completed,
  };
}
