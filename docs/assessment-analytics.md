# Focus Snapshot analytics (issues #2 / #11)

Organic DAU funnel events for this path only. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/assessmentEvents.ts`. KPI dashboard + weekly readout: `docs/kpi-funnel.md`.

Assessments are entertainment / self-insight only — payloads must not imply a medical or diagnostic result.

| Event | When | Payload |
| --- | --- | --- |
| `assessment_started` | Player taps Start on the intro | `assessment_id` (`focus_snapshot`), `source` (`onboarding` \| `today` \| `practice` \| `deeplink`) |
| `assessment_completed` | Snapshot finishes and a score is saved | `assessment_id`, `source`, `score` (0–100), `focus`, `speed`, `consistency`, `duration_sec`, `rounds` |
| `result_shared` | Share sheet is presented after a successful capture/fallback | `assessment_id`, `score`, `share_method` (`image` \| `fallback_text`) |

On-card field names for ASO / the future Figma card: `docs/assessment-result-card.md`.
