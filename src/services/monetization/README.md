# Monetization (not implemented)

Braintino ships with **no ads and no ad placeholders**. This folder only
documents where Google AdMob could be integrated later with minimal changes.

## Where ads could hook in later

- `src/game/engines/session.ts` — every session transition (game → results →
  next game / home) flows through these helpers. An interstitial after
  `isSessionComplete(...)` for the `after_daily_session` placement would be a
  single call site.
- `src/app/results.tsx` — the results screen is modular; a rewarded placement
  (e.g. `cosmetic_reward`) could be added as a separate component without
  restructuring the screen.
- `src/store/useGameStore.ts` — `finishSession()` is the single centralized
  completion path; frequency capping and "no ads during onboarding/first
  session" logic belongs there.

## Rules for any future integration

- Do not interrupt active gameplay.
- Never gate daily training or accuracy feedback behind ads.
- Respect the calm, low-pressure feel of the app.

See `types.ts` for the future-safe placement types. No runtime ad logic exists
anywhere in the app, and no AdMob packages are installed.
