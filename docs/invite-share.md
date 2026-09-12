# Share + invite loop (issue #7)

Word-of-mouth path on top of the Focus Snapshot card from #2. Logged to Firebase Analytics and AppsFlyer via `src/services/analytics/shareEvents.ts`. Card field contract is unchanged: `docs/assessment-result-card.md`.

Practice / entertainment only — payloads and share copy must not imply a medical or diagnostic result.

## Surfaces

| Surface | When |
| --- | --- |
| `assessment_result` | Share / Challenge on the Focus Snapshot result screen |
| `session_results` | Just earned a 7 / 14 / 30-day streak after a session |
| `progress` | Progress tab, once the current streak is at least 7 |

## Actions

| Action | Sheet | Copy |
| --- | --- | --- |
| Share snapshot / streak | Existing `AssessmentShareCard` capture when a result is mounted; else text | Result uses `share_message`. Streak mentions days + optional score. |
| Challenge a friend | Prefill text + App Store and Play URLs | `inviteMessage` / `genericInviteMessage` / `streakInviteMessage` in `src/game/engines/invite.ts` |

Inbound `braintino://assessment?source=deeplink` already opens Focus Snapshot (expo-router scheme). Universal / App Links are not configured, so invites use store URLs for new installs rather than a custom-scheme link in the message.

Store URLs: `src/constants/storeLinks.ts` (`id6787367632`, `com.techtory.braintino`).

## Events

| Event | When | Payload |
| --- | --- | --- |
| `share_initiated` | Player taps Share snapshot, Share your streak, or Challenge a friend | `share_kind` (`result` \| `invite` \| `streak`), `surface`, `platform` (`ios` \| `android` \| `web`), optional `assessment_id`, `score`, `streak` |
| `share_completed` | Share sheet finishes without cancel (iOS `dismissedAction` is treated as cancel; Android / image capture cannot always distinguish) | Same as initiated + `share_method` (`image` \| `fallback_text`) + optional `activity_type` |
| `invite_tapped` | Player taps Challenge a friend (before the sheet) | `surface`, `platform`, optional `assessment_id`, `score`, `streak` |

`result_shared` (issue #2 / #11) still fires when the Focus Snapshot card is shared from the result screen (`share_kind=result`), so the organic DAU funnel spine is unchanged.

## Streak milestones

Share prompts use badges `streak_7`, `streak_14`, `streak_30`. `streak_14` was added for this loop. Existing streaks are backfilled on load so a later session does not celebrate 14 days as a new earn.
