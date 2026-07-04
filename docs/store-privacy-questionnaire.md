# Store Privacy Questionnaire — Braintino

After adding **Google Analytics for Firebase** (installs, opens, sessions, screen
views → retention / DAU / MAU), the store privacy declarations must change from
"no data collected" to disclose anonymous analytics.

Our configuration matters:

- **No ads, no advertising identifiers.** IDFA is off (`withoutAdIdSupport` on
  iOS) and the Android Advertising ID is off (`google_analytics_adid_collection_enabled=false`).
- **No accounts, no personal info.** Data is not linked to a user's identity.
- **Not used for tracking** across apps/sites → no App Tracking Transparency
  prompt is required on iOS.
- Google acts as our **data processor** (service provider), not a party we "share"
  data with for their own use.

---

## Google Play Console → App content → Data safety

**Does your app collect or share any of the required user data types?** → **Yes**

Declare these data types (all **Collected**, **not Shared**, purpose **Analytics**,
collection is **required** i.e. users can't opt out in-app, **not** processed
ephemerally):

| Category | Data type | Notes |
|---|---|---|
| App activity | **App interactions** | Screen views, session/open events |
| Device or other IDs | **Device or other IDs** | Firebase app-instance / installation ID used to count installs |
| Location *(optional, see note)* | **Approximate location** | GA derives coarse region from IP |

Security section:

- **Is all of the user data collected by your app encrypted in transit?** → **Yes**
  (Firebase uses HTTPS/TLS).
- **Do you provide a way for users to request that their data be deleted?** →
  **No** — the analytics are anonymous and not tied to an identity; uninstalling
  the app stops all further collection. (You may instead point to
  info@techtory.io if you prefer to offer a contact route.)

**Note on Approximate location:** GA4 can resolve an IP address to an approximate
(city/region) location. If you'd rather not declare location at all, you can
reduce geographic granularity to *Country* in the GA4 property
(Admin → Data Settings → Data Collection → Granular location and device data), or
disable Google signals; with country-only resolution most teams treat it as not
"Approximate location." Declaring it is the conservative, safe choice.

---

## App Store Connect → App → App Privacy

**Data Collection** → **Yes, we collect data from this app.**

Add these data types. For **every** one: **Linked to the user? No** and
**Used for tracking? No**, purpose **Analytics**.

| Apple category | Data type | Purpose |
|---|---|---|
| Usage Data | **Product Interaction** | Analytics |
| Identifiers | **Device ID** | Analytics |

Do **not** add:

- **Advertising Data / IDFA** — disabled in our build.
- **Diagnostics / Crash Data** — we did not add Crashlytics.
- **Coarse Location** — the app does not access location services; region is
  derived server-side by Google from IP and never received by us. (If you enable
  Crashlytics or Performance Monitoring later, revisit Diagnostics.)

Because nothing is "Used for tracking," iOS will **not** require an App Tracking
Transparency prompt.

---

## After updating

- Keep the hosted privacy policy URL in both stores pointing at the rewritten
  `privacy-policy.md` (it now discloses the analytics above).
- Re-submit the Data safety form (Play) and save App Privacy (ASC). Changes to
  Data safety may require a new review pass on Play.
