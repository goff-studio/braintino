import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SELECTED } from '@/data/cosmetics';
import type { PlayerProgress } from '@/types/progress';
import { defaultSettings, type PlayerSettings } from '@/types/settings';

const KEYS = {
  progress: 'braintino.progress.v1',
  settings: 'braintino.settings.v1',
} as const;

export function createDefaultProgress(): PlayerProgress {
  return {
    globalLevel: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    totalSessions: 0,
    totalStars: 0,
    unlockedCosmetics: ['scarf_coral'],
    selectedCosmetics: { ...DEFAULT_SELECTED },
    miniGameProgress: {},
    minutesByDate: {},
    dailyHistory: [],
  };
}

async function loadJson<T>(key: string, fallback: T, validate: (v: unknown) => boolean): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!validate(parsed)) return fallback;
    return { ...fallback, ...parsed };
  } catch {
    // Corrupted or unavailable storage — reset safely to defaults.
    return fallback;
  }
}

async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failure should never crash the app; progress stays in memory.
  }
}

export async function loadProgress(): Promise<PlayerProgress> {
  return loadJson(
    KEYS.progress,
    createDefaultProgress(),
    (v) => typeof v === 'object' && v !== null && typeof (v as PlayerProgress).globalLevel === 'number'
  );
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  return saveJson(KEYS.progress, progress);
}

export async function loadSettings(): Promise<PlayerSettings> {
  return loadJson(
    KEYS.settings,
    defaultSettings,
    (v) => typeof v === 'object' && v !== null && typeof (v as PlayerSettings).soundEnabled === 'boolean'
  );
}

export async function saveSettings(settings: PlayerSettings): Promise<void> {
  return saveJson(KEYS.settings, settings);
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.progress);
  } catch {
    // ignore
  }
}
