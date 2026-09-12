# Privacy Policy for Braintino

**Last updated: September 12, 2026**

Braintino ("the app", "we", "us") is a casual puzzle game published by
**Techtory OU**. This Privacy Policy explains what the app stores on your device
and what leaves your device when you use the current store build (version 1.6.0
and later). Braintino has no user accounts and does not ask for your name, email,
or payment card. Game progress stays on your device. The app does use advertising,
analytics, crash reporting, and install-attribution services, which collect a
limited set of technical and usage data as described below.

Braintino is a puzzle game for entertainment and personal practice. It is not a
medical device and does not diagnose, treat, cure, or prevent any disease.

If you have any questions, contact us at **info@techtory.io**.

---

## Summary

- We do **not** ask for your name, email, phone number, precise location,
  contacts, or photos, and the app does not use accounts or logins.
- Your game progress stays **on your device**.
- We **do** show ads through **Google Mobile Ads (AdMob)** unless you buy the
  one-time ad-free purchase. Ads may use an advertising identifier (IDFA on iOS,
  Google Advertising ID on Android) when you allow it.
- We **do** use **Google Analytics for Firebase** and **AppsFlyer** to measure
  installs, usage, and whether an install was organic or paid. You can turn this
  off in **Profile → Analytics & personalized content**.
- We **do** use **Firebase Crashlytics** to collect crash and error reports so
  we can fix the app. This is not tied to the analytics toggle.
- We **do** offer a one-time ad-free purchase processed by Apple or Google, with
  entitlement checked through **RevenueCat**.
- We do **not** sell your data. Advertising and attribution partners receive the
  data needed to show ads and measure campaigns, as described here.

---

## Information We Collect

Braintino does not collect your name, email address, phone number, precise GPS
location, contacts, photos, or payment-card details, and you do not create an
account with us.

Data that can leave your device falls into these groups:

- **Advertising data** from Google Mobile Ads (and its advertising partners)
- **Analytics and attribution events** from Firebase Analytics and AppsFlyer
- **Crash and diagnostic reports** from Firebase Crashlytics
- **Purchase entitlements** from Apple, Google, and RevenueCat, if you buy
  ad-free
- **Technical request data** when the app checks for an Expo over-the-air update

None of this is used to identify you by name. Some of it uses resettable device
or advertising identifiers so ads can be limited, installs can be counted, and
crashes can be grouped.

## Data Stored on Your Device

To let you keep your progress, Braintino saves the following **locally on your
device**, using your device's standard app storage:

- Game progress (levels, stars, XP, coins, streaks, and session history)
- Unlocked and selected cosmetic items
- Your settings (sound, haptics, practice difficulty, accessibility preferences,
  language, the analytics toggle, and reminder schedule)
- Optional onboarding answers used to build a practice plan (a goal, an age
  band, areas you want to practice, and a 5-minute session length). These are
  entertainment preferences, not a medical or diagnostic record.
- A cached flag for whether the ad-free purchase is active
- The date of the last interstitial ad, used only to cap ads at one per day

This progress stays on your device. If you delete the app, it is removed with
it. You can also clear it at any time from **Profile → Reset progress**.

Practice reminders are **local scheduled notifications**. They are set on your
device. We do not run a push-notification service and we do not collect a push
token.

## Advertising

Unless you have purchased ad-free, Braintino shows ads through **Google Mobile
Ads (AdMob)**, a service operated by Google LLC. The current build uses:

- A full-screen **interstitial** after you dismiss the results screen of a
  completed session (never during play, never during onboarding or the first
  session, and at most once per day)
- An **optional rewarded** ad on the daily-complete results screen if you choose
  to watch it for bonus XP

**What is collected for ads.** Google and its advertising partners may receive
technical and advertising data such as:

- Advertising identifiers (IDFA on iOS when you allow tracking; the Google
  Advertising ID on Android unless you have limited it in system settings)
- IP address and a coarse region derived from it (not GPS)
- Device model, operating system, app version, language, and similar technical
  details
- Ad requests, impressions, clicks, and whether a rewarded ad was completed

**Consent.** On iOS the app shows the system **App Tracking Transparency**
prompt before the ad SDK starts. If you decline, ads continue in a
non-personalized form. In regions where it is required, the app also shows
Google's **UMP / GDPR** consent form. You can reopen those choices from
**Profile → Manage ad privacy** when that button is offered. Turning off
**Analytics & personalized content** does **not** remove ads; it only stops
Firebase Analytics and AppsFlyer. Ads stay, they are just less tailored.

**Ad-free.** You can remove ads with a one-time purchase (see
[Purchases](#purchases)). Ad-free installs do not initialize the ad SDK and do
not show the tracking prompt for ads.

Google's policies:

- Google Privacy Policy: https://policies.google.com/privacy
- How Google uses data from apps that use its services: https://policies.google.com/technologies/partner-sites
- Google Advertising Privacy: https://policies.google.com/technologies/ads

## Analytics

If **Profile → Analytics & personalized content** is on (it is on by default;
you can turn it off at any time), Braintino uses **Google Analytics for Firebase**
to understand how the app is used in aggregate so we can improve it.

Firebase Analytics in this build is configured **not** to collect advertising
identifiers (`withoutAdIdSupport` on iOS;
`google_analytics_adid_collection_enabled=false` on Android). Advertising
identifiers used by the app come from AdMob and AppsFlyer, not from this
analytics SDK.

**What is collected.** Typical automatic events plus our own gameplay events:

- App installs (first open), app opens, session starts, screens viewed, and
  time spent
- Device and technical information such as device model, operating system and
  version, app version, language, and a coarse **region/country** derived from
  IP address
- A randomly generated, resettable **app-instance identifier** used to count
  unique installs
- In-app events such as finishing onboarding, finishing a session, Focus
  Snapshot started/completed, sharing a result, opening the catalog, or seeing
  the store-rating prompt
- Optional onboarding answers when you complete the plan builder: a practice
  goal, an **age band** (not your exact age), and the areas you asked to
  practice. These are sent as event parameters so we can see which paths people
  choose. They are not a health record and are not used to diagnose anything.
- Focus Snapshot scores and similar gameplay numbers (overall score and the
  focus / speed / consistency breakdown) so we can see whether that path is
  working. These are game scores, not medical results.

**How we use it.** We use this to measure installs, retention, daily and monthly
active users, and which parts of the app people finish. We look at it in
aggregate, not to identify individuals by name.

**IP addresses.** Firebase Analytics uses your IP address to derive an
approximate region and then discards it; we do not receive or store your IP
address ourselves.

**Google's role.** Google processes this data as described in its own policies
(links in [Advertising](#advertising) and here):

- Firebase Privacy and Security: https://firebase.google.com/support/privacy

Because Google operates globally, this data may be processed on servers in the
United States or other countries.

## Attribution (AppsFlyer)

If **Analytics & personalized content** is on, Braintino also uses **AppsFlyer**,
an attribution service, to tell whether an install was organic or came from a
paid campaign, and to measure in-app events against those campaigns.

**What is collected.** AppsFlyer may receive:

- Advertising identifiers when available (IDFA on iOS only if you allow
  tracking; Google Advertising ID on Android)
- Device and technical information, IP address, and a coarse region
- Install and conversion data (organic vs paid, and a media source when one
  exists)
- The same style of in-app events we send to Firebase (for example session
  completed, onboarding completed, Focus Snapshot completed)

On iOS, AppsFlyer waits for the App Tracking Transparency decision before the
first launch is sent, so IDFA is included only if you allow tracking. Turning
the analytics toggle off stops the AppsFlyer SDK from sending further data.

AppsFlyer policy: https://www.appsflyer.com/legal/services-privacy-policy/

## Crash Reporting

Braintino uses **Firebase Crashlytics** (Google LLC) so we can see when the app
crashes or hits an error we caught and still want to fix. Native crashes and
unhandled errors are collected automatically. This is **not** controlled by the
analytics toggle.

**What is collected.** Crash time, stack traces, breadcrumbs we attach for
context, device model, operating system, app version, and a Crashlytics
install identifier. We do not attach your name or an account id — the app has
no account.

We use this only to keep the app stable. Google's Crashlytics terms are covered
by the Firebase privacy documentation linked above.

## Purchases

Braintino offers a **one-time, non-renewing ad-free purchase**. There is no
subscription.

Payment is handled by the **App Store** or **Google Play**. We never see your
card number. To know whether ad-free is active (including after a reinstall),
the app uses **RevenueCat**, which receives an anonymous app-user identifier
and the store receipt / entitlement for that purchase.

RevenueCat policy: https://www.revenuecat.com/privacy

You can restore a previous purchase from **Profile**.

## App Updates (Network Use)

Braintino can receive small over-the-air content and code updates so we can fix
issues without a new store download. To check for and download these updates,
the app contacts **Expo Application Services (EAS) Update** (`u.expo.dev`).

When this happens, standard technical request information — such as your
device's IP address, operating system, and the app's runtime version — is
processed by Expo solely to deliver the correct update. This does not include
your game progress. Expo's privacy policy: https://expo.dev/privacy

## Children's Privacy

Braintino is a general-audience puzzle game. It is not directed at children
under 13 (or the equivalent minimum age in your jurisdiction). We do not
knowingly collect personal information from children to create profiles or
accounts. Advertising and analytics SDKs may still collect the technical data
described above on any device where the app is installed.

If you believe a child has provided personal information, contact
**info@techtory.io** and we will delete it where we can.

## Data Security

Game data on your device is protected by your device's operating-system
security. Data sent to Google, AppsFlyer, RevenueCat, and Expo travels over
HTTPS/TLS and is handled under those providers' security practices. We do not
run our own account database for Braintino.

## Your Rights and Choices

You control the following:

- **Your game data:** reset it from **Profile → Reset progress**, or remove it
  by uninstalling the app.
- **Analytics and attribution:** turn off **Profile → Analytics & personalized
  content**. That stops Firebase Analytics and AppsFlyer. It does not stop ads
  or crash reports.
- **Personalized ads (iOS):** decline App Tracking Transparency, or change
  later in iOS Settings → Privacy & Security → Tracking.
- **Personalized ads (Android / GDPR regions):** use **Profile → Manage ad
  privacy** when shown, or limit the advertising ID in system settings.
- **Ads entirely:** buy the one-time ad-free purchase, or uninstall the app.
- **Crash reports:** uninstalling the app stops further reports. There is no
  in-app crash-reporting toggle in this version.
- **Deletion / questions:** email **info@techtory.io**. Because we have no
  accounts, we cannot look up a named person in a user database. We can stop
  further collection (uninstall / toggles) and we will delete anything we can
  reasonably identify from your message.

If you are in the European Economic Area, the United Kingdom, or a region with
similar laws, the legal bases we rely on are: performing the contract of
providing the app (local progress, purchases, crash stability), legitimate
interests in understanding aggregate usage, and consent where required for
personalized ads and optional analytics / attribution.

## Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will revise
the "Last updated" date above. Material changes will be reflected in the app
listing and in this document.

## Contact Us

If you have questions or concerns about this Privacy Policy, contact:

**Techtory OU**
Email: **info@techtory.io**
