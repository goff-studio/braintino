import {
  getCrashlytics,
  log,
  recordError,
  type FirebaseCrashlyticsTypes,
} from '@react-native-firebase/crashlytics';

/**
 * Thin wrapper around Firebase Crashlytics (modular API).
 *
 * Native crashes and unhandled JS exceptions are captured automatically by
 * the native module — nothing needs to be called for those. These helpers
 * exist for the cases automation can't see: errors we catch and recover
 * from, and breadcrumbs that give a crash report its context.
 *
 * Same defensive posture as the analytics service: never let crash
 * reporting itself break the app (Expo Go / web have no native module).
 */

let crashlytics: FirebaseCrashlyticsTypes.Module | null = null;

function instance(): FirebaseCrashlyticsTypes.Module {
  if (!crashlytics) crashlytics = getCrashlytics();
  return crashlytics;
}

/** Report an error we caught and handled, so it still shows up in Crashlytics. */
export function recordHandledError(error: unknown, context?: string): void {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    if (context) log(instance(), context);
    recordError(instance(), err);
  } catch (e) {
    if (__DEV__) console.warn('[crashlytics] recordError failed', e);
  }
}

/** Leave a breadcrumb that will be attached to any subsequent crash report. */
export function crashBreadcrumb(message: string): void {
  try {
    log(instance(), message);
  } catch (e) {
    if (__DEV__) console.warn('[crashlytics] log failed', e);
  }
}
