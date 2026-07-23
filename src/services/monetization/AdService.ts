import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { admob, interstitialUnitId, rewardedUnitId, TEST_DEVICE_IDS } from './admob';
import type { MonetizationPlacement } from './types';

type AdMobModule = NonNullable<ReturnType<typeof admob>>;

/**
 * Monetization facade. UI and gameplay call this service only and never import
 * the ad SDK directly. Resolves AdMob lazily and defensively, so with no native
 * module (Expo Go / web) every method is an inert no-op.
 *
 * Braintino's rules (see README.md in this folder):
 *  - Never interrupt active gameplay — the interstitial fires only on the
 *    results screen when a completed session is dismissed.
 *  - Never gate daily training or accuracy feedback behind ads.
 *  - No ads during onboarding or the first-ever session, and at most one
 *    interstitial per day — the calm, low-pressure feel wins over fill rate.
 *
 * Responsibilities: gather consent (iOS ATT prompt at app start + UMP/GDPR) →
 * initialize the SDK → keep one interstitial + one rewarded ad preloaded →
 * show them on demand.
 */

/** Backoff for retrying a failed ad load; doubles per consecutive failure. */
const RETRY_INITIAL_MS = 3000;
const RETRY_MAX_MS = 60_000;

/** Interstitials are skipped until the player has finished this many sessions. */
const MIN_SESSIONS_FOR_ADS = 2;

/** Persisted date key of the last interstitial, enforcing the one-per-day cap. */
const LAST_INTERSTITIAL_KEY = 'braintino.ads.lastInterstitialDate';

/**
 * 'earned'      — watched through, grant the bonus.
 * 'dismissed'   — bailed early, no reward.
 * 'unavailable' — no ad loaded right now (error/backoff/still loading); the UI
 *                 should tell the player to try again instead of granting.
 */
export type RewardedResult = 'earned' | 'dismissed' | 'unavailable';

class AdServiceImpl {
  private mod: AdMobModule | null = null;
  private initialized = false;
  /** Fall back to non-personalized ads when tracking/consent isn't granted. */
  private nonPersonalized = false;
  private privacyOptionsRequired = false;

  private interstitial: ReturnType<AdMobModule['InterstitialAd']['createForAdRequest']> | null = null;
  private interstitialLoaded = false;
  private interstitialRetryMs = RETRY_INITIAL_MS;
  private interstitialRetryTimer: ReturnType<typeof setTimeout> | null = null;
  /** Resolver for the in-flight show() promise, called on CLOSED. */
  private onInterstitialClosed: (() => void) | null = null;
  /** Date key of the last shown interstitial (loaded from storage at init). */
  private lastInterstitialDate: string | null = null;

  private rewarded: ReturnType<AdMobModule['RewardedAd']['createForAdRequest']> | null = null;
  private rewardedLoaded = false;
  private rewardedRetryMs = RETRY_INITIAL_MS;
  private rewardedRetryTimer: ReturnType<typeof setTimeout> | null = null;
  /** UI subscribers notified whenever rewarded availability flips. */
  private rewardedReadyListeners = new Set<(ready: boolean) => void>();
  /** Set by EARNED_REWARD (usually before, sometimes just after CLOSED). */
  private rewardEarned = false;
  /** Resolver for the in-flight rewarded show() promise, called after CLOSED
   *  with the earned verdict snapshotted BEFORE the next ad is preloaded. */
  private onRewardedClosed: ((earned: boolean) => void) | null = null;

  /**
   * One-time bootstrap, called at app start from the root layout. Runs the iOS
   * ATT prompt (and UMP consent) FIRST so the user's tracking decision exists
   * before any SDK sends data, then initializes AdMob and preloads both formats.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    const mod = admob();
    if (!mod) return;
    this.initialized = true;
    this.mod = mod;

    try {
      this.lastInterstitialDate = await AsyncStorage.getItem(LAST_INTERSTITIAL_KEY);
    } catch {
      this.lastInterstitialDate = null;
    }

    await this.gatherConsent(mod);

    // Register test devices before init so emulators (and any listed physical
    // devices) always get test ads, even in a production build used for QA.
    try {
      await mod.default().setRequestConfiguration({ testDeviceIdentifiers: TEST_DEVICE_IDS });
    } catch (e) {
      if (__DEV__) console.log('[Ads] setRequestConfiguration failed', e);
    }

    try {
      await mod.default().initialize();
    } catch (e) {
      if (__DEV__) console.log('[Ads] SDK initialize failed', e);
      return;
    }
    this.preloadInterstitial();
    this.preloadRewarded();
  }

  /** iOS App Tracking Transparency, then UMP/GDPR consent form if required. */
  private async gatherConsent(mod: AdMobModule): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const att = require('expo-tracking-transparency');
        const current = await att.getTrackingPermissionsAsync();
        const result =
          current.status === 'undetermined'
            ? await att.requestTrackingPermissionsAsync()
            : current;
        if (result.status !== 'granted') this.nonPersonalized = true;
      } catch (e) {
        if (__DEV__) console.log('[Ads] ATT failed', e);
        this.nonPersonalized = true;
      }
    }

    try {
      const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } = mod;
      await AdsConsent.gatherConsent();
      const info = await AdsConsent.getConsentInfo();
      this.privacyOptionsRequired =
        info?.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
      if (info && info.canRequestAds === false) this.nonPersonalized = true;
    } catch (e) {
      if (__DEV__) console.log('[Ads] UMP consent failed', e);
    }
  }

  /** Whether an EU "Manage ad privacy" entry point should be offered. */
  isPrivacyOptionsRequired(): boolean {
    return this.privacyOptionsRequired;
  }

  /** True when ad requests must be limited to non-personalized (no consent/ATT). */
  nonPersonalizedOnly(): boolean {
    return this.nonPersonalized;
  }

  /** Re-open the consent form so EU users can change their choices. */
  async showPrivacyOptions(): Promise<void> {
    const mod = this.mod;
    if (!mod) return;
    try {
      await mod.AdsConsent.showPrivacyOptionsForm();
    } catch (e) {
      if (__DEV__) console.log('[Ads] privacy options failed', e);
    }
  }

  // ── Interstitial (after_daily_session / after_practice_session) ──────────

  /** Builds and loads the next interstitial, wiring its lifecycle listeners. */
  private preloadInterstitial(): void {
    const mod = this.mod;
    if (!mod) return;
    const { InterstitialAd, AdEventType } = mod;

    const ad = InterstitialAd.createForAdRequest(interstitialUnitId(mod), {
      requestNonPersonalizedAdsOnly: this.nonPersonalized,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
      this.interstitialRetryMs = RETRY_INITIAL_MS;
    });
    ad.addAdEventListener(AdEventType.ERROR, (e) => {
      if (__DEV__) console.log('[Ads] interstitial load error', e);
      // Drop the dead instance and retry with backoff — otherwise a single
      // failed load (no fill, network blip) kills the format until restart.
      this.interstitialLoaded = false;
      this.interstitial = null;
      this.scheduleInterstitialRetry();
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      // Release the waiting screen, then queue the next ad for later.
      const cb = this.onInterstitialClosed;
      this.onInterstitialClosed = null;
      this.interstitialLoaded = false;
      this.interstitial = null;
      this.preloadInterstitial();
      cb?.();
    });

    this.interstitial = ad;
    this.interstitialLoaded = false;
    try {
      ad.load();
    } catch (e) {
      if (__DEV__) console.log('[Ads] interstitial load failed', e);
      this.interstitial = null;
      this.scheduleInterstitialRetry();
    }
  }

  private scheduleInterstitialRetry(): void {
    if (this.interstitialRetryTimer) return;
    this.interstitialRetryTimer = setTimeout(() => {
      this.interstitialRetryTimer = null;
      // A show-path recovery may have already rebuilt the ad in the meantime.
      if (!this.interstitial) this.preloadInterstitial();
    }, this.interstitialRetryMs);
    this.interstitialRetryMs = Math.min(this.interstitialRetryMs * 2, RETRY_MAX_MS);
  }

  /**
   * Call when the player dismisses the results screen of a COMPLETED session.
   * Shows at most one interstitial per day, never before the player's second
   * finished session, and resolves once dismissed. When skipped, no ad is
   * ready, or there's no native module, it resolves immediately — navigation
   * is never blocked.
   */
  async maybeShowInterstitialAfterSession(opts: {
    placement: MonetizationPlacement;
    /** Total finished sessions including the one just completed. */
    totalSessions: number;
    /** Date key of the session that triggered the placement. */
    dateKey: string;
  }): Promise<void> {
    if (opts.totalSessions < MIN_SESSIONS_FOR_ADS) return;
    if (this.lastInterstitialDate === opts.dateKey) return;
    const shown = await this.showInterstitial();
    if (shown) {
      this.lastInterstitialDate = opts.dateKey;
      AsyncStorage.setItem(LAST_INTERSTITIAL_KEY, opts.dateKey).catch(() => {});
    }
  }

  /** Shows the preloaded interstitial; resolves true only if one was presented. */
  showInterstitial(): Promise<boolean> {
    const ad = this.interstitial;
    if (!this.mod || !ad || !this.interstitialLoaded) {
      if (this.mod && !ad) this.preloadInterstitial();
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      this.onInterstitialClosed = () => resolve(true);
      try {
        ad.show();
      } catch (e) {
        if (__DEV__) console.log('[Ads] interstitial show failed', e);
        this.onInterstitialClosed = null;
        resolve(false);
      }
    });
  }

  // ── Rewarded (cosmetic_reward: bonus coins) ──────────────────────────────

  /**
   * Whether tapping the rewarded bonus button can succeed right now. True when
   * an ad is loaded — or when this build has no ad module at all (Expo Go /
   * web), where the free-grant fallback applies.
   */
  isRewardedReady(): boolean {
    return this.mod ? this.rewardedLoaded : true;
  }

  /** Subscribe to availability flips; fires immediately with the current state. */
  onRewardedReady(cb: (ready: boolean) => void): () => void {
    this.rewardedReadyListeners.add(cb);
    cb(this.isRewardedReady());
    return () => {
      this.rewardedReadyListeners.delete(cb);
    };
  }

  private emitRewardedReady(): void {
    const ready = this.isRewardedReady();
    for (const cb of this.rewardedReadyListeners) cb(ready);
  }

  /** Builds and loads the next rewarded ad, wiring its lifecycle listeners. */
  private preloadRewarded(): void {
    const mod = this.mod;
    if (!mod) return;
    const { RewardedAd, RewardedAdEventType, AdEventType } = mod;

    const ad = RewardedAd.createForAdRequest(rewardedUnitId(mod), {
      requestNonPersonalizedAdsOnly: this.nonPersonalized,
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewardedLoaded = true;
      this.rewardedRetryMs = RETRY_INITIAL_MS;
      this.emitRewardedReady();
    });
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      if (__DEV__) console.log('[Ads] rewarded EARNED_REWARD');
      this.rewardEarned = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, (e) => {
      if (__DEV__) console.log('[Ads] rewarded load error', e);
      // Drop the dead instance and retry with backoff — otherwise a single
      // failed load silently disables the bonus button until app restart.
      this.rewardedLoaded = false;
      this.rewarded = null;
      this.scheduleRewardedRetry();
      this.emitRewardedReady();
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      const cb = this.onRewardedClosed;
      this.onRewardedClosed = null;
      this.rewardedLoaded = false;
      this.emitRewardedReady();
      // EARNED_REWARD can arrive a tick AFTER CLOSED on some platforms, so
      // wait a short grace window, snapshot the verdict, and only THEN recycle
      // the ad — preloadRewarded() resets rewardEarned for the next round, so
      // reading it after the preload would always see false (reward lost).
      setTimeout(() => {
        const earned = this.rewardEarned;
        this.rewarded = null;
        this.preloadRewarded();
        cb?.(earned);
      }, 250);
    });

    this.rewarded = ad;
    this.rewardedLoaded = false;
    this.emitRewardedReady();
    this.rewardEarned = false;
    try {
      ad.load();
    } catch (e) {
      if (__DEV__) console.log('[Ads] rewarded load failed', e);
      this.rewarded = null;
      this.scheduleRewardedRetry();
    }
  }

  private scheduleRewardedRetry(): void {
    if (this.rewardedRetryTimer) return;
    this.rewardedRetryTimer = setTimeout(() => {
      this.rewardedRetryTimer = null;
      // A show-path recovery may have already rebuilt the ad in the meantime.
      if (!this.rewarded) this.preloadRewarded();
    }, this.rewardedRetryMs);
    this.rewardedRetryMs = Math.min(this.rewardedRetryMs * 2, RETRY_MAX_MS);
  }

  /**
   * Shows the shared preloaded rewarded ad. With no native ad module at all
   * (Expo Go / web) it resolves 'earned' — that build can never serve an ad,
   * so the bonus stays testable. When the module exists but no ad is loaded
   * (error backoff, still loading, offline) it resolves 'unavailable' and
   * kicks a recovery preload — the UI should prompt "try again", never grant
   * for free.
   */
  showRewarded(): Promise<RewardedResult> {
    if (!this.mod) return Promise.resolve('earned');
    const ad = this.rewarded;
    if (!ad || !this.rewardedLoaded) {
      if (!ad && !this.rewardedRetryTimer) this.preloadRewarded();
      return Promise.resolve('unavailable');
    }
    this.rewardEarned = false;
    return new Promise<RewardedResult>((resolve) => {
      this.onRewardedClosed = (earned) => resolve(earned ? 'earned' : 'dismissed');
      try {
        ad.show();
      } catch (e) {
        if (__DEV__) console.log('[Ads] rewarded show failed', e);
        this.onRewardedClosed = null;
        resolve('unavailable');
      }
    });
  }
}

export const AdService = new AdServiceImpl();
