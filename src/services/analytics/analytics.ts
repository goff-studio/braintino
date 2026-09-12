import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logAppOpen,
  logEvent,
  logScreenView,
  setAnalyticsCollectionEnabled,
  setUserProperty,
  type FirebaseAnalyticsTypes,
} from '@react-native-firebase/analytics';
import { getTrafficSource, type TrafficSource } from '@/services/analytics/trafficSource';

/**
 * Thin wrapper around Firebase Analytics (modular API).
 *
 * Firebase auto-collects the events that power install / retention / DAU / MAU:
 * `first_open` (install), `session_start`, and `user_engagement`. This module
 * just makes sure collection is on, logs an app-open, and exposes helpers for
 * screen and custom events. No GA4 configuration is required for those metrics.
 */

let analytics: FirebaseAnalyticsTypes.Module | null = null;
let initialized = false;

function instance(): FirebaseAnalyticsTypes.Module {
  if (!analytics) analytics = getAnalytics(getApp());
  return analytics;
}

export async function initAnalytics(enabled: boolean = true): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await setAnalyticsCollectionEnabled(instance(), enabled);
    if (enabled) {
      await logAppOpen(instance());
      await setUserProperty(instance(), 'traffic_source', getTrafficSource());
    }
  } catch (e) {
    // Never let analytics break app startup (e.g. Expo Go / missing native config).
    if (__DEV__) console.warn('[analytics] init failed', e);
  }
}

/**
 * Re-apply the "Analytics & personalized content" consent toggle at runtime.
 * Collection off means Firebase drops all subsequent events on-device.
 */
export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  try {
    await setAnalyticsCollectionEnabled(instance(), enabled);
  } catch (e) {
    if (__DEV__) console.warn('[analytics] consent update failed', e);
  }
}

/** Log a screen view. Names/classes feed GA4 engagement + retention reports. */
export async function trackScreen(name: string): Promise<void> {
  try {
    await logScreenView(instance(), { screen_name: name, screen_class: name });
  } catch (e) {
    if (__DEV__) console.warn('[analytics] trackScreen failed', e);
  }
}

/** Tag the Firebase user so GA4 can filter organic vs paid (issue #11). */
export async function setTrafficSourceProperty(source: TrafficSource): Promise<void> {
  try {
    await setUserProperty(instance(), 'traffic_source', source);
  } catch (e) {
    if (__DEV__) console.warn('[analytics] traffic_source property failed', e);
  }
}

/** Log a custom event. Event/param names must follow GA4 naming rules. */
export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    await logEvent(instance(), name, params);
  } catch (e) {
    if (__DEV__) console.warn('[analytics] trackEvent failed', e);
  }
}
