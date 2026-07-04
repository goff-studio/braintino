/** Global player rank titles, unlocked by global level. */
export const RANKS: { level: number; title: string }[] = [
  { level: 1, title: 'Curious Spark' },
  { level: 4, title: 'Focus Friend' },
  { level: 8, title: 'Memory Mapper' },
  { level: 13, title: 'Puzzle Pilot' },
  { level: 19, title: 'Bright Thinker' },
  { level: 26, title: 'Mind Explorer' },
  { level: 34, title: 'Tino’s Champion' },
];

/** XP needed to go from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 60;
}

export function rankForLevel(level: number): string {
  let title = RANKS[0].title;
  for (const rank of RANKS) {
    if (level >= rank.level) title = rank.title;
  }
  return title;
}

/** Returns the new level and leftover XP after adding earned XP. */
export function applyXp(level: number, xp: number, earned: number): { level: number; xp: number } {
  let newLevel = level;
  let pool = xp + earned;
  while (pool >= xpForLevel(newLevel)) {
    pool -= xpForLevel(newLevel);
    newLevel += 1;
  }
  return { level: newLevel, xp: pool };
}
