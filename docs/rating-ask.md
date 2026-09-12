# Rating-ask analytics (issue #1)

One-time store-rating prompt after a successful daily session. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/ratingEvents.ts`. Eligibility rules live in `src/services/review/eligibility.ts`.

Practice / entertainment only — payloads must not imply a medical or diagnostic result. No paid or fake ratings.

## Eligibility (source of truth in code comments)

Ask only when the session felt successful. Never ask after a failed / frustrated session (incomplete daily, unfinished exercise, or average accuracy below 70%).

Softened early ask:

| Reason | When |
| --- | --- |
| `strong_session_1` | First completed daily with high accuracy (≥ 85%), or a successful first daily plus a Focus Snapshot score ≥ 70 |
| `early_streak` | Completed daily on a 2–3 day streak, session not frustrated |
| `successful_session` | Later completed daily (missed the early window), session not frustrated |

One-shot: accept or dismiss, then never ask again.

## Events

| Event | When | Payload |
| --- | --- | --- |
| `rating_ask_shown` | Soft-ask card becomes visible | `eligibility`, `streak`, `daily_days`, `avg_accuracy` (0–100) |
| `rating_ask_accepted` | Player taps “Sure, I’ll rate it” | same |
| `rating_ask_dismissed` | Player taps “Maybe later” | same |

`eligibility` is one of `strong_session_1` | `early_streak` | `successful_session`.

## Growth milestone: 50 real ratings

Cold apps with near-zero ratings barely surface in search. Track toward **50+ real store ratings** in the Firebase / AppsFlyer dashboard or a sheet:

1. `rating_ask_shown` — ask volume
2. `rating_ask_accepted` — leading indicator (player opened the native prompt)
3. Store Connect / Play Console rating count — lagging (OS throttles the native sheet)

No in-app KPI dashboard. Filter accepted events by `eligibility` if conversion looks weak on day 1 vs streak.
