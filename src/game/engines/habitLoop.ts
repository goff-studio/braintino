import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import {
  selectReminderCopy,
  type ReminderContent,
  type ReminderCopyContext,
} from '@/services/notifications/reminderCopy';
import type { PlayerProgress } from '@/types/progress';
import { daysBetweenKeys, todayKey, tomorrowKey } from '@/utils/date';

/** In-app streak-save line after a daily session (results + home). */
export function streakSaveMessage(streak: number): string {
  if (streak <= 1) {
    return 'Day 1 is in. Come back tomorrow to lock in the habit.';
  }
  return `Your ${streak}-day streak is saved. Come back tomorrow to keep it going.`;
}

export function reminderContextFor(
  progress: PlayerProgress,
  today: string = todayKey()
): ReminderCopyContext {
  const dailyCompletedToday = progress.lastDailyCompletedDate === today;
  const nextKey = dailyCompletedToday ? tomorrowKey() : today;
  return {
    streak: progress.streak,
    dailyCompletedToday,
    nextPlanTitle: getTodayDailyPlan(nextKey, progress).title,
  };
}

export function reminderContentFor(
  progress: PlayerProgress,
  today: string = todayKey()
): ReminderContent {
  return selectReminderCopy(reminderContextFor(progress, today));
}

export function shouldLogD1Return(args: {
  firstOpenDate: string | null;
  d1ReturnLogged: boolean;
  today: string;
}): { log: boolean; daysSinceFirstOpen: number } {
  if (args.d1ReturnLogged || !args.firstOpenDate) {
    return { log: false, daysSinceFirstOpen: 0 };
  }
  const daysSinceFirstOpen = daysBetweenKeys(args.firstOpenDate, args.today);
  if (daysSinceFirstOpen < 1) {
    return { log: false, daysSinceFirstOpen };
  }
  return { log: true, daysSinceFirstOpen };
}
