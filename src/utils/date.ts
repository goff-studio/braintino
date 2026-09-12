/** Local-timezone date key, e.g. "2026-07-04". */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dateKey();
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

export function tomorrowKey(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

/** Whole calendar days from `fromKey` to `toKey` (YYYY-MM-DD). */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function daysAgoKey(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateKey(d);
}

/** 0 = Sunday ... 6 = Saturday, from a date key. */
export function weekdayFromKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Date keys for the week containing `from` (Monday..Sunday, local). */
export function weekKeysFrom(from: Date = new Date()): string[] {
  const day = (from.getDay() + 6) % 7; // 0 = Monday
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() - day + i);
    keys.push(dateKey(d));
  }
  return keys;
}

/** Date keys for the current week (Monday..Sunday). */
export function currentWeekKeys(): string[] {
  return weekKeysFrom();
}

/** Monday date key of the week containing `from`. */
export function weekStartKey(from: Date = new Date()): string {
  return weekKeysFrom(from)[0];
}

export function currentWeekKey(): string {
  return weekStartKey();
}

/**
 * Stable week index from a Monday date key. 1970-01-05 was a Monday;
 * used to rotate weekly challenge themes without a calendar library.
 */
export function weekIndexFromKey(mondayKey: string): number {
  const [y, m, d] = mondayKey.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  const epochMonday = Date.UTC(1970, 0, 5);
  return Math.floor((t - epochMonday) / (7 * 86_400_000));
}

/** Whole days from `fromKey` until the next Monday (Sunday → 1). */
export function daysUntilNextWeek(fromKey: string): number {
  const weekday = weekdayFromKey(fromKey); // 0 = Sunday
  return weekday === 0 ? 1 : 8 - weekday;
}
