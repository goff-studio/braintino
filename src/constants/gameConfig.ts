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
    /**
     * An exercise's first plays climb in bigger steps, so a strong player
     * reaches their real level in days instead of weeks. Calibration seeds
     * the start; this fast-tracks whatever discovery remains.
     */
    placement: { sessions: 3, jump: 3, raise: 2 },
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

  /**
   * Onboarding warm-up staircase: short bursts of one exercise whose level
   * jumps while the player is clean and fast, walks back on misses, and
   * settles once the climb stalls. The settled level seeds every exercise's
   * starting point (via getStartingLevel).
   */
  calibration: {
    gameId: 'focus_flash',
    roundsPerBlock: 3,
    maxBlocks: 5,
    /** Non-climbing bursts (hold/fail) that end the run. */
    maxStalls: 2,
    /** ~90 seconds of data never places above Advanced. */
    maxPlacement: 12,
    /** Level steps per burst outcome ('hold' steps 0). */
    steps: { perfect: 3, solid: 1, fail: -2 },
    /** Burst accuracy thresholds ('perfect' also requires the RT target). */
    thresholds: { perfect: 0.99, solid: 0.8, hold: 0.6 },
    /** Flat warm-up reward; calibration skips normal XP/badge scoring. */
    xpReward: 30,
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
