/**
 * Local reminder copy variants for the D1→D2 habit loop.
 * Titles/bodies are entertainment / practice only — no medical claims.
 */

export type ReminderVariant = 'session_ready' | 'streak_risk' | 'next_session';

export type ReminderContent = {
  variant: ReminderVariant;
  title: string;
  body: string;
};

export type ReminderCopyContext = {
  streak: number;
  dailyCompletedToday: boolean;
  nextPlanTitle: string;
};

export const defaultReminderContent: ReminderContent = {
  variant: 'session_ready',
  title: 'Today’s session is ready',
  body: 'Five focused minutes of attention, memory, and speed.',
};

/** Pick notification copy from streak risk vs. next-session readiness. */
export function selectReminderCopy(ctx: ReminderCopyContext): ReminderContent {
  if (ctx.dailyCompletedToday) {
    if (ctx.streak <= 1) {
      return {
        variant: 'next_session',
        title: 'Tomorrow’s session is ready',
        body: `${ctx.nextPlanTitle} · come back to lock in day 2.`,
      };
    }
    return {
      variant: 'next_session',
      title: 'Keep your streak going',
      body: `${ctx.nextPlanTitle} tomorrow · ${ctx.streak}-day streak saved.`,
    };
  }

  if (ctx.streak > 0) {
    return {
      variant: 'streak_risk',
      title:
        ctx.streak === 1 ? 'Day 1 is waiting' : `Your ${ctx.streak}-day streak is waiting`,
      body: `${ctx.nextPlanTitle} · five minutes keeps it going.`,
    };
  }

  return {
    variant: 'session_ready',
    title: 'Today’s session is ready',
    body: `${ctx.nextPlanTitle} · five focused minutes.`,
  };
}
