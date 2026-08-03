import type { ReminderFrequency } from '@/types/settings';
import { dateKey } from '@/utils/date';

/**
 * Web no-op stub. Metro picks this file on web builds so the native
 * expo-notifications module (and its SSR-unfriendly side effects) is never
 * imported there — the practice reminder is a native-only feature.
 */

export type ReminderPermission = 'granted' | 'denied' | 'blocked';

export function initNotifications(): void {}

export async function ensureReminderPermission(): Promise<ReminderPermission> {
  return 'denied';
}

export function nextAnchorKey(hour: number, minute: number): string {
  const fireToday = new Date();
  fireToday.setHours(hour, minute, 0, 0);
  const day = new Date();
  if (fireToday <= new Date()) day.setDate(day.getDate() + 1);
  return dateKey(day);
}

export async function cancelReminder(): Promise<void> {}

export async function scheduleReminder(
  _frequency: ReminderFrequency,
  _hour: number,
  _minute: number,
  _anchorKey: string
): Promise<void> {}

export async function syncReminder(
  _frequency: ReminderFrequency,
  _hour: number,
  _minute: number,
  _anchorKey: string
): Promise<boolean> {
  return false;
}
