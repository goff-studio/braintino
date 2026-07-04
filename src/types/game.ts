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
  stars: 1 | 2 | 3;
  xp: number;
  coins: number;
  skillScores: Partial<Record<SkillType, number>>;
  completed: boolean;
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
  location: string;
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
  /** Pattern Garden: repeat the sequence backwards. */
  reverse?: boolean;
  /** Route Recall: the map rotates after the preview. */
  rotateMap?: boolean;
  /** Market Memory: list uses a category or exclusion rule. */
  listMode?: 'items' | 'category' | 'exclusion';
  /** Focus Flash: what the player must recall. */
  focusRule?: 'center' | 'location' | 'colorMatch' | 'dual';
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

export type SessionMode = 'daily' | 'practice';

export type SessionState = {
  mode: SessionMode;
  plan: MiniGameId[];
  index: number;
  results: MiniGameResult[];
  dateKey: string;
};
