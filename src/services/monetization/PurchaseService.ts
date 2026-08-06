import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Type-only import (erased at build) — never triggers a runtime require, so
// this module is safe to import from files that also run under Expo Go / web.
import type PurchasesType from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';

/**
 * Ad-free subscription via RevenueCat. Same facade rules as AdService: UI
 * calls this service only, and with no native module (Expo Go / web) every
 * method is an inert no-op reporting "not ad-free".
 *
 * RevenueCat setup (project "Techtory Games"): the offering is fetched by
 * IDENTIFIER, never `offerings.current` — the project is shared with other
 * Techtory apps and their own current offering must stay untouched.
 */

const API_KEY = Platform.select({
  ios: 'appl_XLFamMIFPladCGedFdOwAetmbow',
  android: 'goog_zLNDHFkSgCiRoDKisdbheRVjlBU',
  default: '',
});

const OFFERING_ID = 'braintino_default';
const ENTITLEMENT_ID = 'braintino_ad_free';

/**
 * Cached entitlement verdict so ads can be gated synchronously at cold start,
 * before the SDK finishes configuring. RevenueCat remains the source of truth
 * and refreshes this on every launch and purchase.
 */
const AD_FREE_CACHE_KEY = 'braintino.adFree.v1';

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'failed';

function purchasesModule(): typeof PurchasesType | null {
  if (!NativeModules.RNPurchases) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-purchases').default;
  } catch (e) {
    if (__DEV__) console.log('[Purchases] module load failed', e);
    return null;
  }
}

class PurchaseServiceImpl {
  private mod: typeof PurchasesType | null = null;
  private initialized = false;
  private adFree = false;
  private listeners = new Set<(adFree: boolean) => void>();

  /** Synchronous verdict for ad gating; kept fresh by the SDK listener. */
  isAdFree(): boolean {
    return this.adFree;
  }

  isAvailable(): boolean {
    return NativeModules.RNPurchases != null;
  }

  /** Notifies immediately with the current value, then on every change. */
  subscribe(listener: (adFree: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.adFree);
    return () => this.listeners.delete(listener);
  }

  /**
   * Fast boot path: restore the last known verdict from disk BEFORE the SDK
   * configures, so the root layout can decide whether to initialize ads.
   */
  async loadCachedAdFree(): Promise<boolean> {
    try {
      this.adFree = (await AsyncStorage.getItem(AD_FREE_CACHE_KEY)) === 'true';
    } catch {
      this.adFree = false;
    }
    return this.adFree;
  }

  /** One-time bootstrap from the root layout. Safe to call on web/Expo Go. */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    const mod = purchasesModule();
    if (!mod || !API_KEY) return;
    this.initialized = true;
    this.mod = mod;
    try {
      mod.configure({ apiKey: API_KEY });
      mod.addCustomerInfoUpdateListener((info) => {
        this.setAdFree(info.entitlements.active[ENTITLEMENT_ID] != null);
      });
      const info = await mod.getCustomerInfo();
      this.setAdFree(info.entitlements.active[ENTITLEMENT_ID] != null);
    } catch (e) {
      if (__DEV__) console.warn('[Purchases] init failed', e);
    }
  }

  /** The yearly ad-free package (with localized price), or null when absent. */
  async getAdFreePackage(): Promise<PurchasesPackage | null> {
    if (!this.mod) return null;
    try {
      const offerings = await this.mod.getOfferings();
      const offering = offerings.all[OFFERING_ID];
      return offering?.annual ?? offering?.availablePackages[0] ?? null;
    } catch (e) {
      if (__DEV__) console.warn('[Purchases] getOfferings failed', e);
      return null;
    }
  }

  async purchaseAdFree(): Promise<PurchaseOutcome> {
    if (!this.mod) return 'failed';
    const pkg = await this.getAdFreePackage();
    if (!pkg) return 'failed';
    try {
      const { customerInfo } = await this.mod.purchasePackage(pkg);
      const active = customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
      this.setAdFree(active);
      return active ? 'purchased' : 'failed';
    } catch (e) {
      if ((e as { userCancelled?: boolean }).userCancelled) return 'cancelled';
      if (__DEV__) console.warn('[Purchases] purchase failed', e);
      return 'failed';
    }
  }

  /** Re-sync a previous purchase (new device, reinstall). */
  async restorePurchases(): Promise<boolean> {
    if (!this.mod) return false;
    try {
      const info = await this.mod.restorePurchases();
      const active = info.entitlements.active[ENTITLEMENT_ID] != null;
      this.setAdFree(active);
      return active;
    } catch (e) {
      if (__DEV__) console.warn('[Purchases] restore failed', e);
      return false;
    }
  }

  private setAdFree(value: boolean): void {
    if (value === this.adFree) return;
    this.adFree = value;
    AsyncStorage.setItem(AD_FREE_CACHE_KEY, String(value)).catch(() => {});
    for (const listener of this.listeners) listener(value);
  }
}

export const PurchaseService = new PurchaseServiceImpl();
