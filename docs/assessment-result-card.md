# Focus Snapshot result-card fields (issue #2)

Visual layout is **placeholder only** until a Figma pass is reviewed. Do not treat the current result UI as listing art.

These field names are the contract for ASO listing copy and the future share-card design. Share plumbing (`src/services/share/shareCard.ts`) captures whatever view is mounted as the card; swap the placeholder for the Figma card without renaming fields.

Assessments are entertainment / self-insight only. None of these fields is a medical, diagnostic, IQ, or ADHD measure.

## On-card / share-image fields

Rendered by `RESULT_CARD_FIELDS` in `src/game/engines/assessment.ts` and shown on the placeholder card.

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `brand` | string | `Braintino` | Wordmark text. |
| `assessment_id` | string | `focus_snapshot` | Stable id; also used in analytics. |
| `assessment_name` | string | `Focus Snapshot` | User-facing name. ASO may lock a store-facing variant later. |
| `score` | number 0–100 | `78` | Weighted entertainment snapshot (`0.4*focus + 0.35*speed + 0.25*consistency`). |
| `score_max` | number | `100` | Always 100. |
| `band_label` | string | `Sharp snapshot` | **Draft placeholder** band. ASO should lock final listing language. Not a diagnosis. |
| `band_blurb` | string | `Clean attention on this short run.` | **Draft placeholder** one-liner. Same caveat as `band_label`. |
| `focus` | number 0–100 | `82` | Cue accuracy on this run. |
| `speed` | number 0–100 | `70` | Response-time score on this run. |
| `consistency` | number 0–100 | `81` | Response-time steadiness on this run. |
| `disclaimer_short` | string | `Entertainment only · Not a diagnosis` | Short card footer. |
| `disclaimer` | string | see below | Full notice (also on intro / result). |

Full disclaimer (`disclaimer`):

> For entertainment and self-insight only. Not a medical, diagnostic, or clinical test — and not a measure of IQ, ADHD, or any health condition.

Draft `band_label` thresholds (placeholder copy, not clinical cutoffs):

| Score | `band_label` | `band_blurb` |
| --- | --- | --- |
| ≥ 85 | Lightning snapshot | Quick and accurate on this run. |
| ≥ 70 | Sharp snapshot | Clean attention on this short run. |
| ≥ 55 | Steady snapshot | A solid, even pace this time. |
| else | Warming up | A starting point — try another run anytime. |

## Off-card payload (stored + analytics, not required on the image)

| Field | Type | Notes |
| --- | --- | --- |
| `accuracy` | number 0–1 | Raw correct / total. |
| `reactionTimeMedian` | number (ms), optional | Median response time. |
| `completedRounds` | number | Rounds finished. |
| `mistakes` | number | Incorrect answers. |
| `durationSec` | number | Elapsed seconds. |
| `completedAt` | ISO string | Local completion time. |
| `source` | `onboarding` \| `today` \| `practice` \| `deeplink` | Funnel entry. |

## Share sheet

| Field | Notes |
| --- | --- |
| `share_message` | `I scored {score}/100 on Braintino's Focus Snapshot. Entertainment only — not a diagnosis.` |
| `share_method` | Analytics only: `image` (captured placeholder or future Figma card) or `fallback_text`. |

See `docs/assessment-analytics.md` for `assessment_started`, `assessment_completed`, and `result_shared`.
