# Personalization onboarding analytics (issue #5)

Clever-lite plan-builder funnel.

| Event | Owner | When | Payload |
| --- | --- | --- | --- |
| `onboarding_step_viewed` | `onboardingEvents.ts` | A step becomes visible | `step` (`welcome` \| `goal` \| `age` \| `weak_spots` \| `time` \| `reminder` \| `plan`), `step_index` (0-based) |
| `plan_generated` | `onboardingEvents.ts` | The personal-plan step is shown | `goal`, `age_band`, `weak_spots`, `weak_spot_count`, `time_minutes` (always 5), `difficulty_mode`, `plan_title` |
| `onboarding_completed` | `funnelEvents.ts` (via store) | Player leaves onboarding | `mode`, `next` (`calibration` \| `first_session` \| `assessment` \| `today` \| `home`), `reminder_enabled`, `traffic_source`, plus `goal` / `age_band` when a personal plan exists |

Practice / entertainment only — payloads must not imply a medical or diagnostic result. Accessibility toggles are settings, not events.
