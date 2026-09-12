import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '@/constants/gameConfig';
import type { AssessmentResult } from '@/types/assessment';
import type { MiniGameResult } from '@/types/game';
import type { PlayerProgress } from '@/types/progress';
import { parsePersonalPlan } from '@/game/engines/personalPlan';
import { defaultSettings, type DifficultyMode, type PlayerSettings } from '@/types/settings';
import { todayKey } from '@/utils/date';
import { clamp } from '@/utils/math';

const KEYS = {
  progress: 'braintino.progress.v2',
  settings: 'braintino.settings.v2',
  assessment: 'braintino.assessment.v1',
} as const;

/** Pre-redesign keys. Kept on disk for rollback; read once for migration. */
const LEGACY_KEYS = {
  progress: 'braintino.progress.v1',
  settings: 'braintino.settings.v1',
} as const;

export function createDefaultProgress(): PlayerProgress {
  return {
    schemaVersion: 2,
    globalLevel: 1,
    xp: 0,
    streak: 0,
    totalSessions: 0,
    earnedBadges: {},
    miniGameProgress: {},
    minutesByDate: {},
    practiceByDate: {},
    dailyHistory: [],
  };
}

async function readJson(key: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failure should never crash the app; progress stays in memory.
  }
}

/** v1 → v2 settings: playStyle + relaxedMode collapse into difficultyMode. */
function migrateSettingsV1toV2(v1: Record<string, unknown>): PlayerSettings {
  const playStyle = v1.playStyle as string | undefined;
  const relaxedMode = v1.relaxedMode === true;
  const difficultyMode: DifficultyMode =
    playStyle === 'challenge' ? 'challenging' : playStyle === 'relaxed' || relaxedMode ? 'relaxed' : 'balanced';
  return {
    ...defaultSettings,
    soundEnabled: typeof v1.soundEnabled === 'boolean' ? v1.soundEnabled : true,
    hapticsEnabled: typeof v1.hapticsEnabled === 'boolean' ? v1.hapticsEnabled : true,
    reducedMotion: v1.reducedMotion === true,
    highContrast: v1.highContrast === true,
    biggerText: v1.biggerText === true,
    onboardingDone: v1.onboardingDone === true,
    analyticsEnabled: v1.analyticsEnabled !== false,
    difficultyMode,
    personalPlan: null,
  };
}

/**
 * v1 → v2 progress. Per-exercise levels move from the old 1–50 balance to the
 * 1–20 adult scale: old 1 → baseline, 30 → ~10, 50 → ~14 (balanced mode).
 * Coins, stars, and cosmetics are retired; streak/XP/history are preserved.
 */
function migrateProgressV1toV2(
  v1: Record<string, unknown>,
  mode: DifficultyMode
): PlayerProgress {
  const next = createDefaultProgress();
  const { baseline } = gameConfig.modes[mode];
  const today = todayKey();

  if (typeof v1.globalLevel === 'number') next.globalLevel = v1.globalLevel;
  if (typeof v1.xp === 'number') next.xp = v1.xp;
  if (typeof v1.streak === 'number') next.streak = v1.streak;
  if (typeof v1.lastPlayedDate === 'string') next.lastPlayedDate = v1.lastPlayedDate;
  if (typeof v1.lastDailyCompletedDate === 'string') {
    next.lastDailyCompletedDate = v1.lastDailyCompletedDate;
  }
  if (typeof v1.totalSessions === 'number') next.totalSessions = v1.totalSessions;
  if (typeof v1.minutesByDate === 'object' && v1.minutesByDate !== null) {
    next.minutesByDate = v1.minutesByDate as Record<string, number>;
  }
  if (Array.isArray(v1.dailyHistory)) next.dailyHistory = v1.dailyHistory as string[];

  const oldMini = (v1.miniGameProgress ?? {}) as Record<string, Record<string, unknown>>;
  for (const [id, mg] of Object.entries(oldMini)) {
    if (!mg || typeof mg !== 'object') continue;
    const oldLevel = typeof mg.level === 'number' ? mg.level : 1;
    next.miniGameProgress[id as keyof PlayerProgress['miniGameProgress']] = {
      level: clamp(baseline - 1 + Math.round(oldLevel * 0.22), baseline, gameConfig.adaptive.maxLevel),
      bestPracticeScore: 0,
      bestAccuracy: typeof mg.bestAccuracy === 'number' ? mg.bestAccuracy : 0,
      sessionsPlayed: typeof mg.sessionsPlayed === 'number' ? mg.sessionsPlayed : 0,
      lastResults: Array.isArray(mg.lastResults) ? (mg.lastResults as MiniGameResult[]) : [],
    };
  }

  // Back-fill milestones that are provably already earned.
  if (next.totalSessions >= 1) next.earnedBadges.first_session = next.lastPlayedDate ?? today;
  if (next.totalSessions >= 25) next.earnedBadges.sessions_25 = next.lastPlayedDate ?? today;
  if (next.totalSessions >= 100) next.earnedBadges.sessions_100 = next.lastPlayedDate ?? today;
  if (next.streak >= 3) next.earnedBadges.streak_3 = today;
  if (next.streak >= 7) next.earnedBadges.streak_7 = today;
  if (next.streak >= 30) next.earnedBadges.streak_30 = today;

  return next;
}

export async function loadSettings(): Promise<PlayerSettings> {
  const v2 = await readJson(KEYS.settings);
  if (v2 && typeof v2.difficultyMode === 'string') {
    const { personalPlan: rawPlan, ...rest } = v2;
    return {
      ...defaultSettings,
      ...rest,
      personalPlan: parsePersonalPlan(rawPlan),
    } as PlayerSettings;
  }
  const v1 = await readJson(LEGACY_KEYS.settings);
  if (v1) {
    const migrated = migrateSettingsV1toV2(v1);
    await saveJson(KEYS.settings, migrated);
    return migrated;
  }
  return defaultSettings;
}

export async function loadProgress(mode: DifficultyMode): Promise<PlayerProgress> {
  const v2 = await readJson(KEYS.progress);
  if (v2 && (v2 as { schemaVersion?: number }).schemaVersion === 2) {
    return { ...createDefaultProgress(), ...(v2 as Partial<PlayerProgress>) };
  }

  const v1 = await readJson(LEGACY_KEYS.progress);
  if (v1 && typeof v1.globalLevel === 'number') {
    const migrated = migrateProgressV1toV2(v1, mode);
    await saveJson(KEYS.progress, migrated);
    return migrated;
  }
  return createDefaultProgress();
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  return saveJson(KEYS.progress, progress);
}

export async function saveSettings(settings: PlayerSettings): Promise<void> {
  return saveJson(KEYS.settings, settings);
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.progress, LEGACY_KEYS.progress]);
  } catch {
    // ignore
  }
}

function isAssessmentResult(value: Record<string, unknown>): value is AssessmentResult {
  return (
    value.id === 'focus_snapshot' &&
    typeof value.score === 'number' &&
    typeof value.focus === 'number' &&
    typeof value.speed === 'number' &&
    typeof value.consistency === 'number'
  );
}

export async function loadLastAssessment(): Promise<AssessmentResult | null> {
  const raw = await readJson(KEYS.assessment);
  if (!raw || !isAssessmentResult(raw)) return null;
  return raw;
}

export async function saveLastAssessment(result: AssessmentResult): Promise<void> {
  return saveJson(KEYS.assessment, result);
}

export async function clearLastAssessment(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.assessment);
  } catch {
    // ignore
  }
}
