import { gameConfig } from '@/constants/gameConfig';
import type { DifficultyConfig, MiniGameId, MiniGameResult } from '@/types/game';
import type { PlayerSettings } from '@/types/settings';
import { clamp, lerp } from '@/utils/math';

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

function baseDifficulty(miniGameId: MiniGameId, level: number): DifficultyConfig {
  const lvl = clamp(level, 1, gameConfig.adaptive.maxLevel);
  switch (miniGameId) {
    case 'focus_flash':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 2], [5, 3], [10, 4], [30, 5]])),
        previewMs: Math.round(ramp(lvl, [[1, 1500], [5, 1200], [10, 950], [20, 750], [30, 600]])),
        distractors: lvl >= 30 ? 2 : lvl >= 20 ? 1 : 0,
        focusRule: lvl < 5 ? 'center' : lvl < 10 ? 'location' : lvl < 20 ? 'colorMatch' : 'dual',
      };
    case 'route_recall':
      return {
        level: lvl,
        choices: 9,
        previewMs: Math.round(ramp(lvl, [[1, 1000], [20, 800], [40, 600]])),
        routeLength: Math.round(ramp(lvl, [[1, 3], [5, 4], [10, 5], [20, 6], [40, 7]])),
        distractors: lvl >= 20 ? 1 : 0,
        rotateMap: lvl >= 30,
      };
    case 'pattern_garden':
      return {
        level: lvl,
        choices: lvl < 5 ? 6 : 9,
        previewMs: Math.round(ramp(lvl, [[1, 900], [20, 700], [40, 550]])),
        sequenceLength: Math.round(ramp(lvl, [[1, 3], [5, 4], [10, 5], [20, 6], [40, 7]])),
        distractors: 0,
        reverse: lvl >= 30,
      };
    case 'color_switch':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 2], [5, 3], [10, 4]])),
        previewMs: 0,
        distractors: lvl >= 10 ? 1 : 0,
        ruleSwitchFrequency: lvl < 10 ? 0 : lvl < 20 ? 6 : lvl < 30 ? 5 : 4,
      };
    case 'signal_shift':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 2], [5, 3]])),
        previewMs: 0,
        distractors: lvl >= 30 ? 1 : 0,
        ruleSwitchFrequency: lvl < 10 ? 8 : lvl < 20 ? 6 : 4,
      };
    case 'market_memory':
      return {
        level: lvl,
        choices: Math.round(ramp(lvl, [[1, 6], [10, 8], [20, 9], [30, 12]])),
        previewMs: Math.round(ramp(lvl, [[1, 4200], [10, 3600], [30, 3000]])),
        sequenceLength: Math.round(ramp(lvl, [[1, 2], [5, 3], [10, 4], [30, 5]])),
        distractors: 0,
        listMode: lvl >= 30 ? 'exclusion' : lvl >= 20 ? 'category' : 'items',
      };
  }
}

export function getRelaxedDifficulty(base: DifficultyConfig, settings: PlayerSettings): DifficultyConfig {
  if (!settings.relaxedMode) return base;
  return {
    ...base,
    previewMs: Math.round(base.previewMs * gameConfig.relaxed.previewMultiplier),
    distractors: Math.max(0, base.distractors - gameConfig.relaxed.distractorReduction),
    relaxedMultiplier: gameConfig.relaxed.previewMultiplier,
  };
}

/** Should the next round be gentler after a rough recent session? */
export function shouldUseEasierRound(
  result: MiniGameResult | undefined,
  recentResults: MiniGameResult[]
): boolean {
  const latest = result ?? recentResults[recentResults.length - 1];
  return latest ? latest.accuracy < gameConfig.adaptive.lower : false;
}

export function getDifficultyForMiniGame(
  miniGameId: MiniGameId,
  level: number,
  settings: PlayerSettings,
  recentResults: MiniGameResult[] = []
): DifficultyConfig {
  let effectiveLevel = level;
  if (shouldUseEasierRound(undefined, recentResults)) {
    effectiveLevel = Math.max(1, level - 1);
  }
  let config = baseDifficulty(miniGameId, effectiveLevel);
  config = getRelaxedDifficulty(config, settings);
  if (settings.playStyle === 'challenge' && !settings.relaxedMode) {
    // Slightly snappier, never punishing.
    config = { ...config, previewMs: Math.round(config.previewMs * 0.92) };
  }
  return config;
}

/**
 * Adaptive level progression. Raises only after two strong sessions,
 * never more than one step at a time, and eases off gently.
 */
export function calculateNextLevel(
  currentLevel: number,
  result: MiniGameResult,
  recentResults: MiniGameResult[]
): number {
  const { raise, lower, maxLevel } = gameConfig.adaptive;
  if (result.accuracy < lower) return Math.max(1, currentLevel - 1);
  const previous = recentResults[recentResults.length - 1];
  if (result.accuracy >= raise && previous && previous.accuracy >= raise) {
    return Math.min(maxLevel, currentLevel + 1);
  }
  return currentLevel;
}

/** Friendly, never-shaming copy for difficulty changes. */
export function difficultyChangeMessage(previousLevel: number, nextLevel: number): string | null {
  if (nextLevel > previousLevel) return 'Balanced challenge selected';
  if (nextLevel < previousLevel) return 'A calmer round is ready';
  return null;
}
