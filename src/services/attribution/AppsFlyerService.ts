import {
  classifyTrafficSource,
  parseConversionPayload,
  type TrafficSource,
} from '@/services/analytics/trafficSource';
import {
  appsflyer,
  APPSFLYER_DEV_KEY,
  APPSFLYER_IOS_APP_ID,
  ATT_WAIT_SECONDS,
} from './appsflyer';

export type TrafficSourceHandler = (info: { trafficSource: TrafficSource }) => void;

/**
 * AppsFlyer attribution facade. UI and gameplay never touch the AppsFlyer SDK
 * directly — they call this service, which resolves the native module lazily and
 * defensively so the game runs identically under Expo Go / web (every method a
 * no-op).
 *
 * Privacy model: attribution is governed by the SAME "Analytics & personalized
 * content" toggle as Firebase (`settings.analyticsEnabled`). When off, the SDK
 * is started in the stopped state and never leaves it. On iOS the SDK waits up
 * to ATT_WAIT_SECONDS for the App Tracking Transparency decision (prompted by
 * AdService at app start) before sending the first launch, so the IDFA is only
 * included with the user's consent.
 */
class AppsFlyerServiceImpl {
  private started = false;
  private consentGranted = true;
  private trafficSourceHandler: TrafficSourceHandler | null = null;
  private lastTrafficSource: TrafficSource | null = null;

  /**
   * Organic vs paid from AppsFlyer conversion data (issue #11). Register
   * before initialize() so the first callback is not missed. When the native
   * module is absent we immediately report `organic`.
   */
  onTrafficSource(handler: TrafficSourceHandler): void {
    this.trafficSourceHandler = handler;
    if (this.lastTrafficSource) handler({ trafficSource: this.lastTrafficSource });
  }

  private emitTrafficSource(source: TrafficSource): void {
    this.lastTrafficSource = source;
    this.trafficSourceHandler?.({ trafficSource: source });
  }

  /** One-time bootstrap. Called at app start from the root layout. */
  async initialize(analyticsEnabled: boolean): Promise<void> {
    if (this.started) return;
    const af = appsflyer();
    if (!af) {
      this.emitTrafficSource('organic');
      return;
    }
    this.started = true;
    this.consentGranted = analyticsEnabled;
    this.registerConversionData(af);

    // Honor the privacy toggle before the SDK sends anything. stop(true) puts
    // the SDK in a halted state; initSdk still runs (needed to configure it) but
    // no data leaves the device until stop(false) is called via applyConsent.
    try {
      af.stop(!analyticsEnabled);
    } catch {
      // non-fatal — older/newer native surfaces may reorder this
    }

    try {
      await af.initSdk({
        devKey: APPSFLYER_DEV_KEY,
        appId: APPSFLYER_IOS_APP_ID, // iOS only; ignored on Android
        isDebug: __DEV__,
        // Wait for the iOS ATT decision so the IDFA is attached when granted.
        timeToWaitForATTUserAuthorization: ATT_WAIT_SECONDS,
        onInstallConversionDataListener: true,
        onDeepLinkListener: false,
      });
    } catch (e) {
      if (__DEV__) console.log('[AppsFlyer] initSdk failed', e);
    }
  }

  private registerConversionData(af: NonNullable<ReturnType<typeof appsflyer>>): void {
    try {
      af.onInstallConversionData((res) => {
        if (!this.consentGranted) return;
        const source = classifyTrafficSource(parseConversionPayload(res));
        this.emitTrafficSource(source);
      });
    } catch (e) {
      if (__DEV__) console.log('[AppsFlyer] conversion listener failed', e);
      this.emitTrafficSource('organic');
    }
  }

  /**
   * Re-apply the privacy toggle. Called after the user flips the Analytics
   * setting so attribution starts/stops without an app restart.
   */
  applyConsent(analyticsEnabled: boolean): void {
    this.consentGranted = analyticsEnabled;
    const af = appsflyer();
    if (!af) return;
    try {
      af.stop(!analyticsEnabled);
    } catch {
      // non-fatal
    }
  }

  /**
   * Log an in-app event to AppsFlyer for ROI/attribution. No-ops when the module
   * is absent or the user has opted out of analytics.
   */
  logEvent(eventName: string, values: Record<string, unknown> = {}): void {
    if (!this.consentGranted) return;
    const af = appsflyer();
    if (!af) return;
    void af.logEvent(eventName, values).catch(() => {});
  }
}

export const AppsFlyerService = new AppsFlyerServiceImpl();
