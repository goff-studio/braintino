# Organic DAU funnel (issue #11)

Light KPI pass — not a BI product. North star: **100 organic DAU**.

Practice / entertainment only. Funnel payloads must not imply a medical or diagnostic result.

## KPI dashboard

Read these weekly. Filter in-app events by Firebase user property `traffic_source=organic` (default; paid UA is unused). Store metrics stay in the consoles.

| KPI | Definition | Source |
| --- | --- | --- |
| Organic installs / day | New devices attributed organic | AppsFlyer → Overview, Media source = organic. Cross-check: Firebase `first_open` where `traffic_source=organic` |
| DAU | Unique users with a session that day | Firebase Analytics → Engagement → Active users (1-day). AppsFlyer Activity as backup |
| D1 retention | % of `first_open` cohort active the next calendar day | Firebase Retention (D1). Leading indicator: `d1_return` with `days_since_first_open=1` |
| D7 retention | % of `first_open` cohort active on day 7 | Firebase Retention (D7) |
| Ratings count | Cumulative store ratings (real only) | App Store Connect + Play Console. Leading: `rating_ask_accepted` |
| Search impressions (store) | Impressions from store search | App Store Connect → Analytics → App Store → Search. Play Console → Store performance → Store listing |
| Assessment completion | Finished Focus Snapshots | `assessment_completed` (Firebase + AppsFlyer) |
| Shares | Result card / fallback text shared | `result_shared` |

No in-app dashboard. Pin a GA4 Exploration + the AppsFlyer Overview + the two store consoles. Copy numbers into the weekly readout below.

## Event coverage map

Install → onboarding → first session → D1 return → rating ask → assessment → share.

| Step | Event | Where | Notes |
| --- | --- | --- | --- |
| Install | `first_open` (Firebase, auto) + AppsFlyer install | SDK auto | Do not emit a custom `install`. `firstOpenDate` is stamped in settings on first hydrate |
| Onboarding | `onboarding_completed` | `src/services/analytics/funnelEvents.ts` | `mode`, `next` (`calibration` \| `assessment` \| `home`), `reminder_enabled`, `traffic_source` |
| First session | `first_session` | `funnelEvents.ts` | First completed daily or practice session (`totalSessions === 1`). `mode`, `traffic_source` |
| D1 return | `d1_return` | `docs/habit-loop-analytics.md` | Once per install, first open on a later calendar day |
| Rating ask | `rating_ask_shown` / `accepted` / `dismissed` | `docs/rating-ask.md` | Eligibility in `src/services/review/eligibility.ts` |
| Assessment | `assessment_started` / `assessment_completed` | `docs/assessment-analytics.md` | Focus Snapshot only |
| Share | `result_shared` | `docs/assessment-result-card.md` | `share_method` = `image` \| `fallback_text` |

Related (not the spine, but useful in the same readout):

| Event | Doc |
| --- | --- |
| `reminder_enabled` | `docs/habit-loop-analytics.md` |
| `daily_completed` | `docs/habit-loop-analytics.md` |
| `free_play_started` | `docs/catalog-analytics.md` |
| `weekly_challenge_started` / `weekly_challenge_completed` | `docs/catalog-analytics.md` |
| `share_initiated` / `share_completed` / `invite_tapped` | `docs/invite-share.md` |
| `calibration_completed` | `src/store/useGameStore.ts` (`placement_level`, `blocks`, `mode`) |
| `session_completed` | AppsFlyer only — every finished session after the first |

Screen views (`trackScreen`) cover `/onboarding`, `/assessment`, `/results`, tabs.

## Organic vs paid

| Tag | When |
| --- | --- |
| `organic` | Default. AppsFlyer `af_status=Organic`, empty conversion data, or SDK absent (Expo Go / web) |
| `paid` | AppsFlyer `af_status=Non-organic`, or a non-empty `media_source` other than `organic` |

Wiring:

1. AppsFlyer `onInstallConversionData` (`src/services/attribution/AppsFlyerService.ts`) classifies the install (`src/services/analytics/trafficSource.ts`).
2. Value is persisted as `settings.trafficSource` and cached in-process.
3. Firebase user property `traffic_source` is set at analytics init and whenever attribution updates, so every later event can be filtered.
4. New funnel events (`onboarding_completed`, `first_session`) also send `traffic_source` as a param for AppsFlyer / BigQuery.

Paid is unused today. Keep the tag so a future campaign does not land in the organic DAU count.

## Weekly readout

Copy this block into Slack / Notion each Monday. Week = Mon–Sun, local store timezone.

```md
# Braintino weekly KPI — WEEK_OF_YYYY-MM-DD

North star: 100 organic DAU. Filter in-app events to traffic_source=organic.

| KPI | This week | Last week | Δ | Source |
| --- | ---: | ---: | ---: | --- |
| Organic installs / day (avg) |  |  |  | AppsFlyer organic |
| Organic DAU (avg) |  |  |  | Firebase 1-day actives |
| D1 retention |  |  |  | Firebase Retention |
| D7 retention |  |  |  | Firebase Retention |
| Store ratings (cumulative) |  |  |  | ASC + Play |
| rating_ask_accepted |  |  |  | Firebase |
| Search impressions (iOS) |  |  |  | ASC Search |
| Search impressions (Play) |  |  |  | Play Store performance |
| assessment_completed |  |  |  | Firebase |
| result_shared |  |  |  | Firebase |

## Funnel (unique users, organic, this week)

install (first_open) → onboarding_completed → first_session → d1_return → rating_ask_shown → assessment_completed → result_shared

| Step | Users | Conv. from previous |
| --- | ---: | ---: |
| first_open |  | — |
| onboarding_completed |  |  |
| first_session |  |  |
| d1_return (days_since_first_open=1) |  |  |
| rating_ask_shown |  |  |
| assessment_completed |  |  |
| result_shared |  |  |

## What's working / stuck

- Working:
- Stuck:
- Ship next:
```

Fill store cells by hand (no API in this app). If a cell is unknown, write `n/a` rather than inventing a number.
