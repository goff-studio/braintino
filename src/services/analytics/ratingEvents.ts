import { trackEvent } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import type { RatingAskEligible } from '@/services/review/eligibility';

/**
 * Store-rating ask events (issue #1).
 *
 * Exact names + payload fields (also in /docs/rating-ask.md):
 *
 * rating_ask_shown
 * rating_ask_accepted
 * rating_ask_dismissed
 *   eligibility: string     'strong_session_1' | 'early_streak' | 'successful_session'
 *   streak: number
 *   daily_days: number      completed daily days on record
 *   avg_accuracy: number    session average accuracy, 0–100
 *
 * Growth milestone: 50 real store ratings. Leading indicator is the
 * count of `rating_ask_accepted` in Firebase / a sheet — not an in-app
 * dashboard. Native store ratings lag (iOS ~3 prompts/year).
 *
 * Do not invent medical / diagnostic properties.
 */

export type RatingAskEventParams = {
  eligibility: RatingAskEligible['reason'];
  streak: number;
  daily_days: number;
  avg_accuracy: number;
};

export function ratingAskEventParams(decision: RatingAskEligible): RatingAskEventParams {
  return {
    eligibility: decision.reason,
    streak: decision.streak,
    daily_days: decision.dailyDays,
    avg_accuracy: Math.round(decision.avgAccuracy * 100),
  };
}

function emit(name: string, params: RatingAskEventParams): void {
  void trackEvent(name, params);
  AppsFlyerService.logEvent(name, params);
}

export function trackRatingAskShown(decision: RatingAskEligible): void {
  emit('rating_ask_shown', ratingAskEventParams(decision));
}

export function trackRatingAskAccepted(decision: RatingAskEligible): void {
  emit('rating_ask_accepted', ratingAskEventParams(decision));
}

export function trackRatingAskDismissed(decision: RatingAskEligible): void {
  emit('rating_ask_dismissed', ratingAskEventParams(decision));
}
