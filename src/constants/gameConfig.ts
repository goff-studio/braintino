/** Global tuning knobs for scoring, difficulty, and sessions. */
export const gameConfig = {
  roundsPerSession: {
    focus_flash: 8,
    route_recall: 3,
    pattern_garden: 3,
    color_switch: 12,
    signal_shift: 12,
    market_memory: 3,
  } as Record<string, number>,

  /** Internal 1–3 session rating thresholds (accuracy). */
  stars: {
    three: 0.9,
    two: 0.75,
  },

  xp: {
    perRound: 5,
    accuracyMax: 40,
    speedBonusMax: 10,
  },

  adaptive: {
    /** Accuracy for a +2 jump (paired with the median-RT gate). */
    jump: 0.92,
    /** Accuracy for a +1 raise. */
    raise: 0.85,
    /** At or above this the level holds steady. */
    stableFloor: 0.7,
    /** Below stableFloor but at/above this: assist first, drop only on repeat. */
    softFloor: 0.55,
    maxLevel: 20,
    maxStep: 2,
  },

  /** Difficulty modes: starting baseline, adaptive floor, and pacing modifiers. */
  modes: {
    relaxed: { baseline: 3, floor: 2, previewMultiplier: 1.25, distractorDelta: -1, thresholdShift: 0 },
    balanced: { baseline: 4, floor: 4, previewMultiplier: 1, distractorDelta: 0, thresholdShift: 0 },
    challenging: { baseline: 6, floor: 6, previewMultiplier: 0.9, distractorDelta: 1, thresholdShift: -0.02 },
  },

  /** Extra preview time on the play after a soft (0.55–0.69) round. */
  assist: {
    previewMultiplier: 1.15,
  },

  /** Practice Score weights — an app practice metric, not a health measure. */
  practiceScore: {
    accuracy: 0.45,
    consistency: 0.25,
    completion: 0.15,
    difficulty: 0.15,
  },

  /** Median response-time targets (ms) gating the +2 difficulty jump. */
  rtTargets: {
    focus_flash: 2000,
    route_recall: 1500,
    pattern_garden: 1200,
    color_switch: 1500,
    signal_shift: 1600,
    market_memory: 2000,
  } as Record<string, number>,

  dailyGamesPerSession: 3,
} as const;
