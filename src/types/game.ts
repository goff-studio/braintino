export type SkillType =
  | 'speed'
  | 'attention'
  | 'memory'
  | 'navigation'
  | 'flexibility'
  | 'inhibition';

export type MiniGameId =
  | 'focus_flash'
  | 'route_recall'
  | 'pattern_garden'
  | 'color_switch'
  | 'signal_shift'
  | 'market_memory';

export type MiniGameResult = {
  miniGameId: MiniGameId;
  level: number;
  /** 0..1 */
  accuracy: number;
  reactionTimeMedian?: number;
  completedRounds: number;
  mistakes: number;
  /** 0..1 — response-time steadiness (MAD-based). */
  consistency: number;
  /** 0..1 — completed rounds over the exercise's round count. */
  completionRate: number;
  /** 0..100 — internal practice score (accuracy/consistency/completion/difficulty). */
  practiceScore: number;
  /** Internal 1–3 session rating. Optional: absent on some legacy results. */
  stars?: 1 | 2 | 3;
  /** Legacy field from the retired coin economy; never written anymore. */
  coins?: number;
  xp: number;
  skillScores: Partial<Record<SkillType, number>>;
  completed: boolean;
  /** Level change applied after this result (set by the store). */
  difficultyDelta?: number;
  /** True when this result set a new best practice score (set by the store). */
  isPersonalBest?: boolean;
};

export type MiniGameConfig = {
  id: MiniGameId;
  title: string;
  shortTitle: string;
  skill: SkillType;
  skillLabel: string;
  description: string;
  howToPlay: string;
  baseDurationSec: number;
  icon: string;
  color: string;
  gradient: readonly [string, string, ...string[]];
  unlockLevel: number;
};

export type DifficultyConfig = {
  level: number;
  choices: number;
  previewMs: number;
  sequenceLength?: number;
  distractors: number;
  ruleSwitchFrequency?: number;
  routeLength?: number;
  relaxedMultiplier?: number;
  /** Pattern Sequence: repeat the sequence backwards. */
  reverse?: boolean;
  /** Route Memory: the map rotates after the preview. */
  rotateMap?: boolean;
  /** Practical Memory: list uses a category or exclusion rule. */
  listMode?: 'items' | 'category' | 'exclusion';
  /** Processing Speed: what the player must recall. */
  focusRule?: 'location' | 'colorMatch' | 'dual';
  /** Focus Control: probability that word and ink color conflict. */
  conflictRate?: number;
};

/** Raw outcome a mini-game reports before scoring. */
export type RoundsSummary = {
  correct: number;
  total: number;
  mistakes: number;
  completedRounds: number;
  reactionTimesMs: number[];
  completed: boolean;
};

export type SessionMode = 'daily' | 'practice' | 'weekly';

/** Weekly challenge mode twist (issue #6) — existing engine flags, not new games. */
export type WeeklyTwistId = 'switch' | 'reverse' | 'dual' | 'everyday';

export type SessionState = {
  mode: SessionMode;
  plan: MiniGameId[];
  index: number;
  results: MiniGameResult[];
  dateKey: string;
  /** Monday date key when mode is weekly. */
  weekKey?: string;
  /** Mode twist applied for the weekly set. */
  twist?: WeeklyTwistId;
};
