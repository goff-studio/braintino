# Release candidate 1.6.0

Package for the `new-design` store RC. Smoke the paths in [`release-smoke.md`](release-smoke.md), then paste [`whats-new.md`](whats-new.md) into App Store Connect and Play Console. Do **not** auto-submit from this package.

## Version

| File | Before this RC | This RC |
| --- | --- | --- |
| `app.json` → `expo.version` | `1.5.0` | **`1.6.0`** |
| `package.json` → `version` | `1.5.0` | **`1.6.0`** |

`1.5.0` is still what `main` ships (set 28 Aug 2026, before Focus Snapshot, the plan builder, locales, weekly challenge, and the share/invite loop). This RC is a user-facing feature drop, so marketing version is bumped to **1.6.0**.

`runtimeVersion.policy` is `appVersion`, so 1.6.0 also starts a new OTA runtime. EAS remote versioning (`eas.json` `appVersionSource: "remote"` + production `autoIncrement: true`) owns `ios.buildNumber` / `android.versionCode` — do not hand-edit those.

If App Store Connect or Play already has an unreleased `1.6.0` draft, keep this number. If `1.5.0` never reached the stores, Alireza can revert the bump to `1.5.0` before the production build.

## What landed on `new-design` since `main`

Closed issues in this drop: #1 rating ask, #2 Focus Snapshot, #3 ASO listing, #4 habit loop, #5 plan-builder onboarding, #6 free play + weekly challenge, #7 share/invite, #8 locales (listing + in-app), #11 organic DAU funnel.

Store listing source files: `store-assets/store-listing.md` plus ES / PT-BR / DE / FR siblings.

## EAS — cut an RC build (do not submit)

EAS is configured (`eas.json`, project `436faa82-9b38-4ddf-8ead-6c35be7704fd`). Preview and production builds consume the Expo plan’s build credits. This package documents the commands; it does not run them.

### Internal preview (sideload / TestFlight-like install)

`preview` is internal distribution, Android **APK**, channel `preview`. Closest “cheap to share” profile — still billed.

```bash
# both platforms (same as npm run preview)
npx eas-cli build --profile preview --platform all

# or one platform
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile preview --platform android
```

iOS preview needs each device registered first:

```bash
npx eas-cli device:create
```

Install from the EAS build page. Android APK installs directly. iOS uses ad hoc / internal signing — not the App Store binary.

### Production binary for store review (build only)

```bash
npx eas-cli build --profile production --platform all
```

Production sets `EXPO_PUBLIC_ADS_ENV=production` and auto-increments remote build numbers. **Do not** pass `--auto-submit`. **Do not** run `yarn release` / `npm run release` — `scripts/release.js` bumps the version again and runs production build **with** `--auto-submit`.

After smoke and copy review, submit the existing binaries:

```bash
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

`eas.json` submit.production: iOS ASC app `6787367632` / team `NQ3552RHB7`; Android Play **internal** track, `releaseStatus: draft`.

## Next steps for Alireza (store submit)

1. Merge this PR into `new-design`.
2. Walk [`release-smoke.md`](release-smoke.md) on a device build (preview APK / iOS internal, or a production binary that has **not** been submitted).
3. Cut production EAS builds with the command above. Wait for both to finish. Do not submit yet.
4. App Store Connect: version **1.6.0**, paste What’s New from [`whats-new.md`](whats-new.md). Listing copy + screenshots: `store-assets/`.
5. Play Console: same What’s New (500-char EN block; locale drafts in the same file). Promote from the internal/draft track only after smoke.
6. Privacy / Data safety: re-read [`store-privacy-questionnaire.md`](store-privacy-questionnaire.md) before submit. That note still describes a no-ads / no-Crashlytics app; this binary includes Google Mobile Ads, Firebase Analytics, Crashlytics, and AppsFlyer. Update ASC App Privacy + Play Data safety to match the live SDKs.
7. When smoke is green and copy is pasted, run the two `eas-cli submit` commands (or upload the artifacts in the consoles). Then submit iOS for review and promote Play when ready.
