# Monetization

Braintino serves ads through Google AdMob (`react-native-google-mobile-ads`),
registered under the shared Techtory publisher `pub-1657859223488791`. All ad
logic lives behind `AdService.ts`; UI and gameplay never import the ad SDK
directly. `admob.ts` resolves the native module lazily so Expo Go / web builds
no-op instead of crashing, and serves Google test ids everywhere except the
production EAS build (`EXPO_PUBLIC_ADS_ENV=production` in eas.json).

## Placements (types.ts)

- `after_daily_session` / `after_practice_session` — one interstitial, shown
  only when the results screen of a **completed** session is dismissed
  ([results.tsx](../../app/results.tsx) `goHome`). `AdService` enforces the
  caps: never before the player's second finished session, at most one per day
  (persisted under `braintino.ads.lastInterstitialDate`).
- `cosmetic_reward` — opt-in rewarded ad
  ([RewardedBonusCard](../../components/RewardedBonusCard.tsx)) on the
  daily-complete results screen; grants `REWARDED_BONUS_XP`. (The placement key
  predates the redesign and is kept for ad-reporting continuity.)

## Consent

`AdService.initialize()` runs at app start from the root layout: iOS ATT prompt
first, then the UMP/GDPR consent form when required, then SDK init + preload.
No consent → non-personalized ad requests. The Settings "Analytics &
personalized content" toggle separately gates Firebase Analytics + AppsFlyer
(see `src/services/attribution/`).

## Rules (unchanged)

- Do not interrupt active gameplay.
- Never gate daily training or accuracy feedback behind ads.
- Respect the calm, low-pressure feel of the app.
