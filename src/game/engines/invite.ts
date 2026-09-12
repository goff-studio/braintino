import { storeLinksBlock } from '@/constants/storeLinks';
import { shareMessage } from '@/game/engines/assessment';
import type { AssessmentResult } from '@/types/assessment';

/** Streak days that unlock a share / friend-challenge prompt (issue #7). */
export const SHARE_STREAK_MILESTONES = [7, 14, 30] as const;
export type ShareStreakMilestone = (typeof SHARE_STREAK_MILESTONES)[number];

export const SHARE_STREAK_BADGE_IDS = {
  7: 'streak_7',
  14: 'streak_14',
  30: 'streak_30',
} as const;

export function withStoreLinks(body: string): string {
  return `${body}\n\n${storeLinksBlock()}`;
}

export function isShareStreakMilestone(value: number): value is ShareStreakMilestone {
  return (SHARE_STREAK_MILESTONES as readonly number[]).includes(value);
}

export function shareStreakFromBadgeId(id: string): ShareStreakMilestone | null {
  if (id === 'streak_7') return 7;
  if (id === 'streak_14') return 14;
  if (id === 'streak_30') return 30;
  return null;
}

/** Highest 7 / 14 / 30 badge in a just-earned set, if any. */
export function newestShareStreak(badgeIds: readonly string[]): ShareStreakMilestone | null {
  let best: ShareStreakMilestone | null = null;
  for (const id of badgeIds) {
    const days = shareStreakFromBadgeId(id);
    if (days !== null && (best === null || days > best)) best = days;
  }
  return best;
}

/** Current streak mapped to the latest shareable milestone (or null). */
export function shareableStreakReached(streak: number): ShareStreakMilestone | null {
  if (streak >= 30) return 30;
  if (streak >= 14) return 14;
  if (streak >= 7) return 7;
  return null;
}

/**
 * Friend-challenge copy. Always entertainment-only — do not invent
 * medical, diagnostic, IQ, or ADHD claims.
 */
export function inviteMessage(result: AssessmentResult): string {
  return withStoreLinks(
    `I scored ${result.score}/100 on Braintino's Focus Snapshot. Think you can beat it? Entertainment only — not a diagnosis.`
  );
}

export function genericInviteMessage(): string {
  return withStoreLinks(
    `Challenge: take Braintino's Focus Snapshot and see your score. Five-minute daily practice. Entertainment only — not a diagnosis.`
  );
}

export function streakInviteMessage(
  days: number,
  result?: AssessmentResult | null
): string {
  const scoreBit = result
    ? ` and scored ${result.score}/100 on Focus Snapshot.`
    : '.';
  return withStoreLinks(
    `I just hit a ${days}-day streak on Braintino${scoreBit} Think you can beat it? Entertainment only — not a diagnosis.`
  );
}

export function shareBodyForKind(args: {
  kind: 'result' | 'invite' | 'streak';
  result?: AssessmentResult | null;
  streakDays?: number;
}): string {
  if (args.kind === 'invite') {
    return args.result ? inviteMessage(args.result) : genericInviteMessage();
  }
  if (args.kind === 'streak') {
    return streakInviteMessage(args.streakDays ?? 7, args.result);
  }
  if (args.result) return shareMessage(args.result);
  return genericInviteMessage();
}
