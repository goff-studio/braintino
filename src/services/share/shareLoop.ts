import { Platform } from 'react-native';
import { shareBodyForKind } from '@/game/engines/invite';
import { trackResultShared } from '@/services/analytics/assessmentEvents';
import {
  trackInviteTapped,
  trackShareCompleted,
  trackShareInitiated,
  type ShareKind,
  type ShareSurface,
} from '@/services/analytics/shareEvents';
import { shareAssessmentCard, shareTextInvite, type ShotRef } from '@/services/share/shareCard';
import type { AssessmentResult } from '@/types/assessment';

export type { ShareKind, ShareSurface };

export type PresentShareArgs = {
  kind: ShareKind;
  surface: ShareSurface;
  viewRef?: ShotRef | null;
  result?: AssessmentResult | null;
  streakDays?: number;
};

/**
 * One entry for result / invite / streak shares.
 * Invite is prefilled text + store URLs (installs). Result and streak reuse
 * the Focus Snapshot card when a capture target is mounted.
 */
export async function presentShare(
  args: PresentShareArgs
): Promise<'completed' | 'cancelled' | 'failed'> {
  const { kind, surface, viewRef, result, streakDays } = args;
  const platform = Platform.OS;
  const eventArgs = { kind, surface, result, streakDays, platform };

  if (kind === 'invite') {
    trackInviteTapped(eventArgs);
  }
  trackShareInitiated(eventArgs);

  const message = shareBodyForKind({ kind, result, streakDays });
  const canCaptureCard = Boolean(result && viewRef && kind !== 'invite');

  try {
    const outcome = canCaptureCard
      ? await shareAssessmentCard(viewRef!, result!, { message })
      : await shareTextInvite(message);

    if (!outcome.completed) return 'cancelled';

    trackShareCompleted({
      ...eventArgs,
      platform: outcome.platform,
      shareMethod: outcome.method,
      activityType: outcome.activityType,
    });

    if (result && kind === 'result') {
      trackResultShared(result, outcome.method);
    }

    return 'completed';
  } catch {
    return 'failed';
  }
}
