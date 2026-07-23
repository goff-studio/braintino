import { NativeModules } from 'react-native';

// Type-only import (erased at build) — never triggers a runtime require, so this
// module is safe to import from files that also run under Expo Go / web.
type AppsFlyerModule = typeof import('react-native-appsflyer').default;

let cached: AppsFlyerModule | null = null;
let resolved = false;

/**
 * Lazily resolves the native AppsFlyer module. Returns null when the native side
 * is absent (Expo Go, web, misconfigured build) so the attribution stack no-ops
 * instead of crashing — the same defensive pattern as the monetization admob
 * resolver.
 */
export function appsflyer(): AppsFlyerModule | null {
  if (resolved) return cached;
  resolved = true;
  if (!NativeModules.RNAppsFlyer) {
    if (__DEV__) console.log('[AppsFlyer] native module absent — attribution disabled');
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('react-native-appsflyer').default;
  } catch (e) {
    if (__DEV__) console.log('[AppsFlyer] module load failed', e);
    cached = null;
  }
  return cached;
}

// ── AppsFlyer credentials ────────────────────────────────────────────────────
// Account-level dev key from the Techtory AppsFlyer dashboard (same value for
// both platforms and shared with the other Techtory apps). The dev key is a
// build-time secret only in the sense that it identifies the app to AppsFlyer;
// it ships inside the binary by design.
export const APPSFLYER_DEV_KEY = 'HEAJ9KSksXHtoWzHJa6MLX';

// iOS App Store numeric id (Apple app id, no "id" prefix) — required for iOS
// attribution. This is Braintino's App Store Connect app record id.
export const APPSFLYER_IOS_APP_ID = '6787367632';

// Seconds the SDK waits for the iOS App Tracking Transparency decision before
// sending the first launch, so the IDFA (when granted) is included in
// attribution. AdService triggers the single ATT prompt at app start; AppsFlyer
// waits for its outcome. No effect on Android.
export const ATT_WAIT_SECONDS = 60;
