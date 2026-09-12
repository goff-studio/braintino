# Free-play + weekly challenge analytics (issue #6)

Catalog aliveness after the 5-minute daily. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/catalogEvents.ts`. KPI dashboard + weekly readout: `docs/kpi-funnel.md`.

Practice / entertainment only — payloads must not imply a medical or diagnostic result.

| Event | When | Payload |
| --- | --- | --- |
| `free_play_started` | Player starts a single-exercise Practice session | `game_id`, `source` (`today` \| `practice` \| `results`) |
| `weekly_challenge_started` | Player starts this week’s 3-exercise challenge | `week_key` (Monday `YYYY-MM-DD`), `title`, `twist` (`switch` \| `reverse` \| `dual` \| `everyday`) |
| `weekly_challenge_completed` | First time that week’s challenge session finishes | `week_key`, `title`, `twist`, `avg_accuracy` (0–1), `total_sessions` |

`week_key` is the local Monday of the week, matching `currentWeekKeys()[0]`. Completing again in the same week does not re-fire `weekly_challenge_completed`.
