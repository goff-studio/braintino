import { getTodayDailyPlan } from '@/game/engines/dailyTraining';
import { localizedDailyTitle, localizedStreakSave } from '@/i18n/copy';
import {
  selectReminderCopy,
  type ReminderContent,
  type ReminderCopyContext,
} from '@/services/notifications/reminderCopy';
import type { PersonalPlan } from '@/types/plan';
import type { PlayerProgress } from '@/types/progress';
import { daysBetweenKeys, todayKey, tomorrowKey } from '@/utils/date';

/** In-app streak-save line after a daily session (results + home). */
export function streakSaveMessage(streak: number): string {
  return localizedStreakSave(streak);
}

export function reminderContextFor(
  progress: PlayerProgress,
  today: string = todayKey(),
  personalPlan?: PersonalPlan | null
): ReminderCopyContext {
  const dailyCompletedToday = progress.lastDailyCompletedDate === today;
  const nextKey = dailyCompletedToday ? tomorrowKey() : today;
  const plan = getTodayDailyPlan(nextKey, progress, personalPlan);
  return {
    streak: progress.streak,
    dailyCompletedToday,
    nextPlanTitle: localizedDailyTitle(plan, personalPlan),
  };
}

export function reminderContentFor(
  progress: PlayerProgress,
  today: string = todayKey(),
  personalPlan?: PersonalPlan | null
): ReminderContent {
  return selectReminderCopy(reminderContextFor(progress, today, personalPlan));
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
