import { gameConfig } from '@/constants/gameConfig';
import type { DifficultyConfig, MiniGameId, MiniGameResult } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';
import type { DifficultyMode, PlayerSettings } from '@/types/settings';
import { clamp, lerp, mean } from '@/utils/math';

/** Linear ramp between level anchors, clamped at the ends. */
function ramp(level: number, stops: [number, number][]): number {
  if (level <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [lvl, val] = stops[i];
    if (level <= lvl) {
      const [prevLvl, prevVal] = stops[i - 1];
      return lerp(prevVal, val, (level - prevLvl) / (lvl - prevLvl));
    }
  }
  return stops[stops.length - 1][1];
}

/** Maximum distractors each exercise can meaningfully render. */
const DISTRACTOR_CAPS: Record<MiniGameId, number> = {
  focus_flash: 3,
  route_recall: 1,
  pattern_garden: 0,
  color_switch: 0,
  signal_shift: 1,
  market_memory: 0,
};

/**
 * Base difficulty on the 1–20 scale. Level 4 is the adult baseline
 * ("difficulty 4" in the product spec); 13+ is the Expert extrapolation.
 */
function baseDifficulty(miniGameId: MiniGameId, level: number): DifficultyConfig {
  const lvl = clamp(level, 1, gameConfig.adaptive.maxLevel);
  switch (miniGameId) {
    case 'focus_flash':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 3], [4, 4], [8, 5], [12, 6]])),
        previewMs: Math.round(ramp(lvl, [[1, 1400], [4, 1000], [8, 800], [12, 650], [16, 550]])),
        distractors: lvl >= 14 ? 3 : lvl >= 9 ? 2 : lvl >= 4 ? 1 : 0,
        focusRule: lvl < 4 ? 'location' : lvl < 8 ? 'colorMatch' : 'dual',
      };
    case 'route_recall':
      return {
        level: lvl,
        choices: 9,
        previewMs: Math.round(ramp(lvl, [[1, 1100], [4, 1000], [8, 800], [12, 650], [16, 550]])),
        routeLength: Math.round(ramp(lvl, [[1, 3], [4, 4], [8, 5], [11, 6], [14, 7], [18, 8]])),
        distractors: lvl >= 6 ? 1 : 0,
        rotateMap: lvl >= 10,
      };
    case 'pattern_garden':
      return {
        level: lvl,
        choices: lvl < 6 ? 6 : 9,
        previewMs: Math.round(ramp(lvl, [[1, 850], [4, 750], [8, 650], [12, 550], [16, 480]])),
        sequenceLength: Math.round(ramp(lvl, [[1, 3], [4, 4], [7, 5], [10, 6], [13, 7], [17, 8]])),
        distractors: 0,
        reverse: lvl >= 9,
      };
    case 'color_switch':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 3], [5, 3], [6, 4]])),
        previewMs: 0,
        distractors: 0,
        conflictRate: ramp(lvl, [[1, 0.3], [4, 0.5], [8, 0.65], [12, 0.8]]),
        ruleSwitchFrequency: lvl < 2 ? 0 : lvl < 5 ? 6 : lvl < 8 ? 5 : lvl < 12 ? 4 : 3,
      };
    case 'signal_shift':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 3], [8, 4]])),
        previewMs: 0,
        distractors: lvl >= 10 ? 1 : 0,
        ruleSwitchFrequency: lvl < 6 ? 6 : lvl < 10 ? 5 : lvl < 14 ? 4 : 3,
      };
    case 'market_memory':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 8], [4, 8], [7, 9], [12, 12]])),
        previewMs: Math.round(ramp(lvl, [[1, 4000], [4, 3600], [8, 3200], [12, 2800], [16, 2500]])),
        sequenceLength: Math.round(ramp(lvl, [[1, 3], [4, 4], [8, 5], [12, 6]])),
        distractors: 0,
        listMode: lvl >= 12 ? 'exclusion' : lvl >= 8 ? 'category' : 'items',
      };
  }
}

/** Apply the difficulty-mode pacing modifiers on top of the base config. */
function applyMode(
  miniGameId: MiniGameId,
  config: DifficultyConfig,
  mode: DifficultyMode
): DifficultyConfig {
  const m = gameConfig.modes[mode];
  return {
    ...config,
    previewMs: Math.round(config.previewMs * m.previewMultiplier),
    distractors: clamp(config.distractors + m.distractorDelta, 0, DISTRACTOR_CAPS[miniGameId]),
    relaxedMultiplier: mode === 'relaxed' ? m.previewMultiplier : undefined,
  };
}

/** After a soft round (0.55–0.69 accuracy), the next play gets extra preview time. */
function needsAssist(recentResults: MiniGameResult[]): boolean {
  const latest = recentResults[recentResults.length - 1];
  if (!latest) return false;
  const { softFloor, stableFloor } = gameConfig.adaptive;
  return latest.accuracy >= softFloor && latest.accuracy < stableFloor;
}

export function getDifficultyForMiniGame(
  miniGameId: MiniGameId,
  level: number,
  settings: PlayerSettings,
  recentResults: MiniGameResult[] = []
): DifficultyConfig {
  let config = baseDifficulty(miniGameId, level);
  config = applyMode(miniGameId, config, settings.difficultyMode);
  if (needsAssist(recentResults)) {
    config = { ...config, previewMs: Math.round(config.previewMs * gameConfig.assist.previewMultiplier) };
  }
  return config;
}

/**
 * Adaptive level progression. Strong sessions raise the level quickly
 * (+2 when accuracy and pace are both excellent), soft sessions get assisted
 * before dropping, and the level never falls below the mode's floor.
 */
export function calculateNextLevel(
  currentLevel: number,
  result: MiniGameResult,
  recentResults: MiniGameResult[],
  mode: DifficultyMode
): number {
  const { jump, raise, stableFloor, softFloor, maxLevel } = gameConfig.adaptive;
  const { floor, thresholdShift } = gameConfig.modes[mode];
  const rtTarget = gameConfig.rtTargets[result.miniGameId];
  const fastEnough =
    result.reactionTimeMedian !== undefined
      ? result.reactionTimeMedian <= rtTarget
      : result.accuracy >= 0.97;

  let delta = 0;
  if (result.accuracy >= jump + thresholdShift && fastEnough) {
    delta = 2;
  } else if (result.accuracy >= raise + thresholdShift) {
    delta = 1;
  } else if (result.accuracy >= stableFloor) {
    delta = 0;
  } else if (result.accuracy >= softFloor) {
    // Two soft sessions in a row ease off one level; a single one gets assist.
    const previous = recentResults[recentResults.length - 1];
    delta = previous && previous.accuracy < stableFloor ? -1 : 0;
  } else {
    delta = -1;
  }

  return clamp(currentLevel + delta, floor, maxLevel);
}

/** User-facing difficulty tier for a level on the 1–20 scale. */
export function difficultyTierLabel(level: number): string {
  if (level <= 3) return 'Comfortable';
  if (level <= 6) return 'Balanced';
  if (level <= 9) return 'Challenging';
  if (level <= 12) return 'Advanced';
  return 'Expert';
}

/**
 * Starting level for an exercise with no history: the mode baseline, nudged
 * up when the player's other exercises are already above it.
 */
export function getStartingLevel(progress: PlayerProgress, mode: DifficultyMode): number {
  const { baseline } = gameConfig.modes[mode];
  const levels = Object.values(progress.miniGameProgress)
    .filter((mg): mg is NonNullable<typeof mg> => Boolean(mg))
    .map((mg) => mg.level);
  const avg = mean(levels);
  if (avg === undefined) return baseline;
  return clamp(Math.round(avg) - 1, baseline, gameConfig.adaptive.maxLevel);
}

/** Adult, matter-of-fact copy for difficulty changes. */
export function difficultyChangeMessage(previousLevel: number, nextLevel: number): string | null {
  const delta = nextLevel - previousLevel;
  if (delta >= 2) return 'Strong session — moving up two levels';
  if (delta === 1) return 'Difficulty increased';
  if (delta <= -1) return 'Dialing back one level — accuracy first';
  return null;
}
