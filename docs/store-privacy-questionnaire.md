# Store Privacy Questionnaire — Braintino

Tick these boxes against the **1.6.0** production binary (`EXPO_PUBLIC_ADS_ENV=production`).
Do **not** submit until App Store Connect App Privacy, Play Data safety, and the
hosted privacy policy all match this note.

Source of truth in the repo: [`privacy-policy.md`](../privacy-policy.md).
Hosted URL opened in-app (`src/app/(tabs)/profile.tsx`):

https://glimmer-locket-654.notion.site/Privacy-Policy-for-Braintino-393bc9cb57128085877fe98d8a4295e5

**Alireza: paste the rewritten `privacy-policy.md` into that Notion page before
submit.** The in-app link does not need to change if the Notion content is
updated.

---

## What the binary actually does

| SDK | Where | Consent / gate | What it is for |
|---|---|---|---|
| Google Mobile Ads (AdMob) | `AdService.ts`, `app.json` plugin `react-native-google-mobile-ads` | iOS ATT + UMP/GDPR. **Not** the analytics toggle. Skipped entirely when ad-free. | Interstitial after a completed session (caps: not before 2nd session, once/day). Optional rewarded bonus XP. |
| Firebase Analytics | `analytics.ts`, `withoutAdIdSupport: true`, `firebase.json` `google_analytics_adid_collection_enabled=false` | Profile **Analytics & personalized content** (`settings.analyticsEnabled`, default on) | Installs, opens, screens, custom events (onboarding, sessions, Focus Snapshot, share, rating, catalog). |
| AppsFlyer | `AppsFlyerService.ts` | Same analytics toggle. On iOS waits up to 60s for ATT so IDFA is sent only if granted. | Organic vs paid attribution + the same style of in-app events. |
| Firebase Crashlytics | `crashlytics.ts` | **Always on.** No in-app opt-out. | Native crashes, unhandled JS, handled errors / breadcrumbs. No user id attached. |
| RevenueCat | `PurchaseService.ts` | Only if the player uses IAP / restore | One-time non-consumable ad-free. Anonymous app-user id + store receipt. |
| Expo EAS Update | `app.json` `updates.url` | Always, on launch | OTA runtime check. IP + device/app version to Expo. |
| Local notifications | `notifications.ts` | OS permission, off by default | On-device reminders only. No push token, no backend. |

There **is** an iOS App Tracking Transparency prompt (`expo-tracking-transparency`,
copy in `app.json` `userTrackingUsageDescription`). SKAdNetwork items are
registered for AdMob. Firebase Analytics itself does **not** collect advertising
IDs; AdMob and AppsFlyer **do**.

Prefer over-declaring a data type that partners infer (coarse IP region,
advertising ID, device ID) over claiming "we don't collect that."

No accounts. No medical / diagnostic data. Onboarding `age_band` and
`weak_spots` are entertainment preferences sent as analytics event params when
the analytics toggle is on — declare them as usage / age-band, **not** Health.

---

## Google Play Console

Do these three Play surfaces. Reviewers will see `AD_ID` from AdMob + AppsFlyer.

### 1. Advertising ID (App content → Advertising ID)

**Does your app use the advertising ID?** → **Yes**

**Why?** → **Advertising** (AdMob). AppsFlyer also reads it for attribution when
analytics is on; the required Play purpose for declaring the ID is advertising.

### 2. Data safety (App content → Data safety)

**Does your app collect or share any of the required user data types?** → **Yes**

**Is all of the user data collected by your app encrypted in transit?** → **Yes**
(HTTPS/TLS for Google, AppsFlyer, RevenueCat, Expo).

**Do you provide a way for users to request that their data be deleted?** →
**Yes** — email **info@techtory.io**, plus in-app **Reset progress**, the
analytics toggle, and uninstall. We cannot look up a named account (there isn't
one).

**Do you sell user data?** → **No** (ads are served; we do not sell data as a
product). Sharing for advertising is declared below, not as a sale.

Declare each row. "Shared" = transferred to a third party that is not acting
only as a silent on-device library. AdMob partners and AppsFlyer are **Shared**.
Crashlytics and RevenueCat are treated as **Collected, not Shared** (processors
on our behalf). If Play forces a partner name, list Google and AppsFlyer.

| Category | Data type | Collected | Shared | Optional? | Purposes | Notes |
|---|---|---|---|---|---|---|
| Location | **Approximate location** | Yes | Yes | Analytics/attribution optional; ads required for free users | Advertising or marketing; Analytics | IP-derived city/region from AdMob, AppsFlyer, Firebase. No GPS / no location permission. |
| Personal info | **User IDs** | Yes | No | Yes (only if they use IAP) | App functionality | RevenueCat anonymous app-user id. |
| Personal info | **Age** | Yes | Yes | Yes | Analytics | Onboarding **age band** (`under_25` / `25_34` / `35_49` / `50_plus` / `prefer_not`) sent with `plan_generated` / `onboarding_completed` only when analytics is on. Not exact date of birth. |
| Financial info | **Purchase history** | Yes | No | Yes | App functionality | Ad-free IAP via Play Billing + RevenueCat. No card numbers. |
| App activity | **App interactions** | Yes | Yes | Analytics/attribution optional; ad interactions required for free users | Analytics; Advertising or marketing | Screens, sessions, onboarding, Focus Snapshot, share, rating, catalog; AdMob impressions/clicks. |
| App info and performance | **Crash logs** | Yes | No | Required | App functionality | Crashlytics. Not gated by the analytics toggle. |
| App info and performance | **Diagnostics** | Yes | No | Required | App functionality | Crashlytics breadcrumbs / handled errors + device/app version on crash. |
| Device or other IDs | **Device or other IDs** | Yes | Yes | Analytics optional; advertising IDs required for free users unless limited in OS settings | Advertising or marketing; Analytics; App functionality | IDFA/GAID (AdMob, AppsFlyer), Firebase app-instance id, Crashlytics install id, RevenueCat app-user id. |

Do **not** declare: name, email, phone, precise location, contacts, photos,
health/fitness, payment card number, or "other in-app messages."

**Designed for children / Families?** → **No.** General audience. Ads are present.

### 3. Privacy policy URL

Keep both store listings on the Notion URL above after the page is updated to
match `privacy-policy.md`.

---

## App Store Connect → App Privacy

**Data Collection** → **Yes, we collect data from this app.**

**Do you or your third-party partners use data from this app to track users?**
→ **Yes.**

Tracking here means AdMob personalized ads and AppsFlyer campaign measurement
when an advertising identifier is available (ATT granted on iOS). The app
already shows ATT. SKAdNetwork is also registered; that does not replace the
tracking declaration.

For every type below, set **Linked to the User** and **Used for Tracking**
exactly as written. "Linked" is Yes whenever the data is tied to a persistent
device, advertising, or purchase identifier — we have no name/email account,
but Apple treats those IDs as linking.

| Apple category | Data type | Linked? | Used for tracking? | Purposes |
|---|---|---|---|---|
| Identifiers | **Device ID** | Yes | Yes | Third-Party Advertising; Analytics |
| Identifiers | **User ID** | Yes | No | App Functionality |
| Usage Data | **Product Interaction** | Yes | Yes | Analytics; Third-Party Advertising |
| Usage Data | **Advertising Data** | Yes | Yes | Third-Party Advertising |
| Diagnostics | **Crash Data** | No | No | App Functionality |
| Diagnostics | **Other Diagnostic Data** | No | No | App Functionality |
| Purchases | **Purchase History** | Yes | No | App Functionality |
| Location | **Coarse Location** | Yes | Yes | Third-Party Advertising; Analytics |

Notes for the Coarse Location row: the app does **not** request Core Location.
Google / AppsFlyer derive region from IP. Declare it anyway.

Do **not** add: Precise Location, Contact Info, Health & Fitness, Sensitive
Info, Payment Info (card data — Apple/Google take payment), Contacts, Photos.

**Privacy Policy URL** (App Information + the App Privacy page): the same
Notion URL, after it matches `privacy-policy.md`.

---

## After updating (Alireza — still manual)

Console ticks this PR cannot do:

1. **Notion** — replace the hosted privacy policy with `privacy-policy.md`.
2. **App Store Connect → App Privacy** — save the table above. Tracking = Yes.
3. **Play → Advertising ID** — Yes, purpose Advertising.
4. **Play → Data safety** — save the table above, including Age, Approximate
   location, Crash logs, Device IDs, and Shared = Yes for ads/attribution.
5. Confirm both store listings still point at the Notion URL.
6. Then continue [`release-candidate.md`](release-candidate.md) submit steps.

Re-saving Data safety on Play can trigger an extra review pass. Do it before
the 1.6.0 production submit, not after.
