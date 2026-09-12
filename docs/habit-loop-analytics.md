# Habit-loop analytics (issue #4)

D1→D2 retention funnel. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/habitEvents.ts`. KPI dashboard + weekly readout: `docs/kpi-funnel.md`.

Practice / entertainment only — payloads must not imply a medical or diagnostic result.

| Event | When | Payload |
| --- | --- | --- |
| `reminder_enabled` | OS permission granted and a local reminder is scheduled | `source` (`onboarding` \| `profile`), `frequency` (`daily` \| `everyOtherDay` \| `weekdays`), `hour` (24-hour) |
| `daily_completed` | First daily session completion for that calendar day | `streak`, `total_sessions`, `plan_title` |
| `d1_return` | First app open on a later calendar day than `firstOpenDate` (once) | `days_since_first_open`, `streak`, `completed_daily_yesterday` |

`days_since_first_open === 1` is the classic next-day return. Later first-returns still fire once so the funnel is not dropped.
