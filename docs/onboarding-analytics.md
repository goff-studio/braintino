# Personalization onboarding analytics (issue #5)

Clever-lite plan-builder funnel. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/onboardingEvents.ts`. No KPI dashboard.

Practice / entertainment only — payloads must not imply a medical or diagnostic result.

| Event | When | Payload |
| --- | --- | --- |
| `onboarding_step_viewed` | A step becomes visible | `step` (`welcome` \| `goal` \| `age` \| `weak_spots` \| `time` \| `reminder` \| `plan`), `step_index` (0-based) |
| `plan_generated` | The personal-plan step is shown | `goal`, `age_band`, `weak_spots` (comma-separated ids), `weak_spot_count`, `time_minutes` (always 5), `difficulty_mode`, `plan_title` |
| `onboarding_completed` | Player leaves onboarding into a destination | `next` (`calibration` \| `first_session` \| `assessment` \| `today`), `goal`, `age_band`, `difficulty_mode`, `reminder_enabled` |

`time_minutes` is fixed at 5 to match the existing daily loop. Accessibility toggles are not events — they persist as settings.
