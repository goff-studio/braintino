/**
 * Future-safe monetization types. Nothing in the app renders or references
 * ad UI — see README.md in this folder.
 */

export type MonetizationPlacement =
  | 'after_daily_session'
  | 'after_practice_session'
  | 'cosmetic_reward';

export type MonetizationEvent = {
  placement: MonetizationPlacement;
  /** Date key of the session that triggered the placement. */
  dateKey: string;
};
