/** Global tuning knobs for scoring, stars, and sessions. */
export const gameConfig = {
  roundsPerSession: {
    focus_flash: 8,
    route_recall: 3,
    pattern_garden: 3,
    color_switch: 12,
    signal_shift: 12,
    market_memory: 3,
  } as Record<string, number>,

  stars: {
    three: 0.9,
    two: 0.75,
    one: 0.5,
  },

  xp: {
    perRound: 5,
    perStar: 25,
    accuracyMax: 50,
    speedBonusMax: 10,
  },

  coins: {
    perStar: 10,
    streakBonusMax: 5,
  },

  adaptive: {
    /** Accuracy at or above this for 2 sessions raises the level. */
    raise: 0.9,
    /** Accuracy below this eases the next session. */
    lower: 0.7,
    maxLevel: 50,
  },

  relaxed: {
    previewMultiplier: 1.35,
    distractorReduction: 1,
  },

  dailyGamesPerSession: 3,
} as const;
