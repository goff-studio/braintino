import { NativeModules, Platform } from 'react-native';

// Type-only import (erased at build) — never triggers a runtime require, so this
// module is safe to import from files that also run under Expo Go / web.
type AdMobModule = typeof import('react-native-google-mobile-ads');

let cached: AdMobModule | null = null;
let resolved = false;

/**
 * Lazily resolves the native AdMob module. Returns null when the native side is
 * absent (Expo Go, web, misconfigured build) so the whole ad stack no-ops
 * instead of crashing — the same defensive pattern as the analytics service.
 */
export function admob(): AdMobModule | null {
  if (resolved) return cached;
  resolved = true;
  if (!NativeModules.RNGoogleMobileAdsModule) {
    if (__DEV__) console.log('[Ads] native module absent — ads disabled');
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('react-native-google-mobile-ads');
  } catch (e) {
    if (__DEV__) console.log('[Ads] module load failed', e);
    cached = null;
  }
  return cached;
}

export function adsAvailable(): boolean {
  return admob() != null;
}

// ── Ad unit ids ─────────────────────────────────────────────────────────────
// Production unit ids from the AdMob console (pub-1657859223488791, Braintino
// apps ~6552732376 Android / ~8428654896 iOS). Dev builds fall back to Google's
// test ids below.
//
// Real ads are served ONLY in the production build. Every other context serves
// test ads — Metro/dev (`__DEV__`) AND, critically, the release "preview"/
// internal EAS builds used for QA. A release build has `__DEV__ === false`, so
// gating on `__DEV__` alone would serve REAL ads while you sideload-test and
// get the AdMob account flagged for invalid activity (tapping your own ads).
// EXPO_PUBLIC_ADS_ENV is set to 'production' only in the production EAS profile
// (eas.json); it's statically inlined into the bundle at build time.
export const ADS_PRODUCTION =
  !__DEV__ && process.env.EXPO_PUBLIC_ADS_ENV === 'production';

// Interstitial ad unit ids (slash format), one per platform, from the AdMob
// console ("Session Interstitial" units). A platform with no id falls back to
// Google's test interstitial id in production (no revenue, "Test Ad" label) —
// safe, but no real ads.
const PROD_INTERSTITIAL = Platform.select({
  ios: 'ca-app-pub-1657859223488791/8473987007',
  android: 'ca-app-pub-1657859223488791/7503420187',
  default: '',
});

/**
 * Devices that always receive test ads, as a second safety net for anyone who
 * happens to run a production build for QA. 'EMULATOR' auto-covers all
 * emulators; add the hashed id a physical device prints in the logs on its
 * first ad request ("To get test ads on this device, set
 * testDeviceIdentifiers …").
 */
export const TEST_DEVICE_IDS: string[] = ['EMULATOR'];

export function interstitialUnitId(mod: AdMobModule): string {
  return ADS_PRODUCTION && PROD_INTERSTITIAL ? PROD_INTERSTITIAL : mod.TestIds.INTERSTITIAL;
}

// Rewarded ad unit ids (bonus-XP reward). Same safe-fallback rule as the
// interstitial.
const PROD_REWARDED = Platform.select({
  ios: 'ca-app-pub-1657859223488791/6270229566',
  android: 'ca-app-pub-1657859223488791/2251093509',
  default: '',
});

export function rewardedUnitId(mod: AdMobModule): string {
  return ADS_PRODUCTION && PROD_REWARDED ? PROD_REWARDED : mod.TestIds.REWARDED;
}

/**
 * XP granted by the rewarded placement. The placement key stays
 * 'cosmetic_reward' for ad-reporting continuity; the reward is now bonus XP.
 */
export const REWARDED_BONUS_XP = 25;
