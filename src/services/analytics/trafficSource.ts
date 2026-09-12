/**
 * Organic vs paid install tag (issue #11).
 *
 * AppsFlyer conversion data is the source of truth. Until it arrives — and
 * whenever the native module is absent (Expo Go / web) — we treat traffic as
 * `organic`. Paid UA is unused today; the tag still exists so a future campaign
 * does not mix into the organic DAU funnel.
 *
 * Firebase user property `traffic_source` is set from this value so GA4
 * reports can filter every event. See docs/kpi-funnel.md.
 */

export type TrafficSource = 'organic' | 'paid';

let cached: TrafficSource = 'organic';

export function getTrafficSource(): TrafficSource {
  return cached;
}

export function rememberTrafficSource(source: TrafficSource): void {
  cached = source;
}

/**
 * Map AppsFlyer conversion fields to organic | paid.
 *
 * `af_status` is "Organic" | "Non-organic". A non-empty `media_source` other
 * than "organic" is also paid (Some networks omit af_status).
 */
export function classifyTrafficSource(data: Record<string, unknown>): TrafficSource {
  const status = typeof data.af_status === 'string' ? data.af_status : '';
  if (/non[-_\s]?organic/i.test(status)) return 'paid';
  const media = typeof data.media_source === 'string' ? data.media_source.trim() : '';
  if (media && !/^organic$/i.test(media)) return 'paid';
  return 'organic';
}

/** Normalize the AppsFlyer onInstallConversionData payload (object or JSON string). */
export function parseConversionPayload(res: unknown): Record<string, unknown> {
  if (!res || typeof res !== 'object') return {};
  const raw = (res as { data?: unknown }).data;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  return {};
}
