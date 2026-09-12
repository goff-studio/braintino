/**
 * Local reminder copy variants for the D1→D2 habit loop.
 * Titles/bodies are entertainment / practice only — no medical claims.
 */

import i18n from '@/i18n';

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
        title: i18n.t('habit.reminder.nextDay1Title'),
        body: i18n.t('habit.reminder.nextDay1Body', { title: ctx.nextPlanTitle }),
      };
    }
    return {
      variant: 'next_session',
      title: i18n.t('habit.reminder.keepStreakTitle'),
      body: i18n.t('habit.reminder.keepStreakBody', {
        title: ctx.nextPlanTitle,
        count: ctx.streak,
      }),
    };
  }

  if (ctx.streak > 0) {
    return {
      variant: 'streak_risk',
      title:
        ctx.streak === 1
          ? i18n.t('habit.reminder.day1Waiting')
          : i18n.t('habit.reminder.streakWaiting', { count: ctx.streak }),
      body: i18n.t('habit.reminder.streakRiskBody', { title: ctx.nextPlanTitle }),
    };
  }

  return {
    variant: 'session_ready',
    title: i18n.t('habit.reminder.sessionReadyTitle'),
    body: i18n.t('habit.reminder.sessionReadyBody', { title: ctx.nextPlanTitle }),
  };
}
