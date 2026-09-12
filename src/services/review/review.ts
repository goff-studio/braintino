import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import {
  evaluateRatingEligibility,
  type RatingAskContext,
  type RatingAskDecision,
} from '@/services/review/eligibility';

export {
  RATING_GROWTH_MILESTONE,
  evaluateRatingEligibility,
  sessionFeltFrustrated,
} from '@/services/review/eligibility';
export type {
  RatingAskContext,
  RatingAskDecision,
  RatingAskEligible,
  RatingAskReason,
  RatingAskSkipReason,
} from '@/services/review/eligibility';

/**
 * One-time store-rating ask on the results screen.
 *
 * When-and-why lives in `eligibility.ts` (issue #1). This module only
 * persists the one-shot answer and talks to `expo-store-review`.
 * Apple/Google throttle the native prompt (iOS ~3 shows/year), so we
 * only open it after the player said yes on the soft-ask card.
 */

const RATING_ASK_KEY = 'braintino.ratingAsk.v1';

export type RatingAskGateReason = RatingAskDecision['reason'] | 'already_handled' | 'unavailable';

export type RatingAskGate =
  | Extract<RatingAskDecision, { ask: true }>
  | { ask: false; reason: RatingAskGateReason };

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

/** Whether the rating-ask card should appear, plus the eligibility reason. */
export async function shouldAskForRating(ctx: RatingAskContext): Promise<RatingAskGate> {
  const eligibility = evaluateRatingEligibility(ctx);
  if (!eligibility.ask) return eligibility;
  if (await alreadyHandled()) return { ask: false, reason: 'already_handled' };
  try {
    // False on web and wherever the native review flow can't run.
    if (!(await StoreReview.isAvailableAsync())) {
      return { ask: false, reason: 'unavailable' };
    }
  } catch {
    return { ask: false, reason: 'unavailable' };
  }
  return eligibility;
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
