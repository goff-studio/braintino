import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderFrequency } from '@/types/settings';
import { dateKey } from '@/utils/date';

/**
 * Practice reminder via LOCAL scheduled notifications. Everything is
 * scheduled on-device with expo-notifications — no backend, no push tokens,
 * no third-party delivery service.
 */

const REMINDER_PREFIX = 'practice-reminder';
const ANDROID_CHANNEL_ID = 'practice-reminders';
/**
 * Every-other-day has no repeating trigger type, so one-shot notifications
 * are pre-scheduled this many days ahead; hydrate() re-runs the schedule on
 * every launch, keeping the window rolling. Stays well under iOS's cap of 64
 * pending notifications.
 */
const SCHEDULE_WINDOW_DAYS = 28;

const REMINDER_CONTENT = {
  title: 'Time to practice',
  body: 'Five focused minutes keeps your training on track.',
} as const;

export type ReminderPermission = 'granted' | 'denied' | 'blocked';

function isSupported(): boolean {
  return Platform.OS !== 'web';
}

/** Call once at app start, before any notification can be presented. */
export function initNotifications(): void {
  if (!isSupported()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  // Android 13+ won't even show the permission prompt until a channel exists.
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Practice reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

/**
 * Ensure the OS notification permission, prompting if still undetermined.
 * 'blocked' means the user must flip it in system Settings — re-prompting
 * is not possible.
 */
export async function ensureReminderPermission(): Promise<ReminderPermission> {
  if (!isSupported()) return 'denied';
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';
  const next = await Notifications.requestPermissionsAsync();
  if (next.granted) return 'granted';
  return next.canAskAgain ? 'denied' : 'blocked';
}

/**
 * First day the reminder can still fire at hour:minute — today, or tomorrow
 * when that time has already passed. Used as the every-other-day anchor so
 * the first reminder lands as soon as possible.
 */
export function nextAnchorKey(hour: number, minute: number): string {
  const fireToday = new Date();
  fireToday.setHours(hour, minute, 0, 0);
  const day = new Date();
  if (fireToday <= new Date()) day.setDate(day.getDate() + 1);
  return dateKey(day);
}

export async function cancelReminder(): Promise<void> {
  if (!isSupported()) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(REMINDER_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {}))
  );
}

/** (Re)schedule the reminder. Replaces any previously scheduled reminders. */
export async function scheduleReminder(
  frequency: ReminderFrequency,
  hour: number,
  minute: number,
  anchorKey: string
): Promise<void> {
  if (!isSupported()) return;
  await cancelReminder();

  if (frequency === 'daily') {
    await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_PREFIX}-daily`,
      content: REMINDER_CONTENT,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    return;
  }

  if (frequency === 'weekdays') {
    // WEEKLY weekday numbering: 1 = Sunday … 7 = Saturday, so Mon–Fri = 2–6.
    await Promise.all(
      [2, 3, 4, 5, 6].map((weekday) =>
        Notifications.scheduleNotificationAsync({
          identifier: `${REMINDER_PREFIX}-w${weekday}`,
          content: REMINDER_CONTENT,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
            channelId: ANDROID_CHANNEL_ID,
          },
        })
      )
    );
    return;
  }

  // everyOtherDay: one-shot DATE triggers on days an even number of days
  // from the anchor, over the rolling window.
  const [ay, am, ad] = anchorKey.split('-').map(Number);
  const anchor = new Date(ay, am - 1, ad);
  const now = new Date();
  const jobs: Promise<unknown>[] = [];
  for (let offset = 0; offset < SCHEDULE_WINDOW_DAYS; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const daysSinceAnchor = Math.round((day.getTime() - anchor.getTime()) / 86_400_000);
    if (daysSinceAnchor % 2 !== 0) continue;
    const fire = new Date(day);
    fire.setHours(hour, minute, 0, 0);
    if (fire <= now) continue;
    jobs.push(
      Notifications.scheduleNotificationAsync({
        identifier: `${REMINDER_PREFIX}-d${dateKey(day)}`,
        content: REMINDER_CONTENT,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fire,
          channelId: ANDROID_CHANNEL_ID,
        },
      })
    );
  }
  await Promise.all(jobs);
}

/**
 * Reconcile the schedule with stored settings at app start (only called when
 * the reminder is enabled). Returns whether the reminder is actually active
 * afterwards — false when the OS permission was revoked behind our back, so
 * the caller can flip the setting off.
 */
export async function syncReminder(
  frequency: ReminderFrequency,
  hour: number,
  minute: number,
  anchorKey: string
): Promise<boolean> {
  if (!isSupported()) return false;
  const perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    await cancelReminder();
    return false;
  }
  await scheduleReminder(frequency, hour, minute, anchorKey);
  return true;
}
