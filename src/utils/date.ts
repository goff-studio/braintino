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

/** Date keys for the current week (Monday..Sunday). */
export function currentWeekKeys(): string[] {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0 = Monday
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - day + i);
    keys.push(dateKey(d));
  }
  return keys;
}
