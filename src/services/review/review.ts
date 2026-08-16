import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import type { PlayerProgress } from '@/types/progress';

/**
 * One-time store-rating ask, shown on the results screen once the player has
 * completed the daily session on a second distinct day — an engagement high
 * point rather than an interruption (Apple/Google both throttle the native
 * prompt, iOS to ~3 shows/year, so the moment matters). The UI is a soft-ask
 * card: the native prompt only appears for players who said yes, and either
 * answer means we never ask again.
 */

const RATING_ASK_KEY = 'braintino.ratingAsk.v1';

/** Distinct days with a completed daily session before we ask. */
const MIN_DAILY_DAYS = 2;

let handledCache: boolean | null = null;

async function alreadyHandled(): Promise<boolean> {
  if (handledCache !== null) return handledCache;
  try {
    handledCache = (await AsyncStorage.getItem(RATING_ASK_KEY)) != null;
  } catch {
    handledCache = false;
  }
  return handledCache;
}

function markHandled(outcome: 'accepted' | 'dismissed'): void {
  handledCache = true;
  AsyncStorage.setItem(RATING_ASK_KEY, outcome).catch(() => {});
}

/** Whether the rating-ask card should appear on the results screen. */
export async function shouldAskForRating(progress: PlayerProgress): Promise<boolean> {
  if (progress.dailyHistory.length < MIN_DAILY_DAYS) return false;
  if (await alreadyHandled()) return false;
  try {
    // False on web and wherever the native review flow can't run.
    return await StoreReview.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Player said yes: open the native in-app review prompt. */
export async function requestStoreRating(): Promise<void> {
  markHandled('accepted');
  try {
    await StoreReview.requestReview();
  } catch {
    // The OS may decline to show the prompt (e.g. iOS quota); never surface it.
  }
}

/** Player said "maybe later": stay quiet forever — nagging loses more ratings. */
export function dismissRatingAsk(): void {
  markHandled('dismissed');
}
