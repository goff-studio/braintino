# Store screenshots

Shot list and captions live in [`../store-listing.md`](../store-listing.md) (source of truth).

Figma: https://www.figma.com/design/ws3siWmGHVRfkt3awyKGBz  
Frames: `iPhone / Result` (node `1:2`), `Share Card / 1080` (node `1:39`), `iPhone / Difficulty` (node `5:10`)

## Locked export / shoot order (iOS + Android)

Drop files into `ios/` and `android/` in this order. First three captions are OCR-indexed on iOS.

| # | Shot | File | Status | Figma / source | Caption |
|---|---|---|---|---|---|
| 1 | Result card | `1-result.png` | Present (Figma 3x PNG) | `iPhone / Result` node `1:2` (sample: score 78, band Clear focus, bars focus/speed/consistency, dual disclaimer) | Know your focus score |
| 2 | Share card | `2-share-card.png` | Present (Figma 3x PNG) | `Share Card / 1080` node `1:39` (branded share crop) | Share your brain score |
| 3 | 5-min habit | `3-habit.png` | Present (existing Today session art) | Today / daily session ~5 min + streak. Refresh later if #4 tomorrow-preview / Focus Snapshot CTAs should be visible | Five minutes a day |
| 4 | Skill chart | `4-skills.png` | Present (Progress / Skill Balance) | Weekly balance across skills | See what improved |
| 5 | Calm adult practice | `5-exercise.png` | Present (Processing Speed in progress) | One exercise in progress, no cartoons | Built for adults |
| 6 | Adaptive difficulty | `6-difficulty.png` | Present (Figma 3x PNG) | `iPhone / Difficulty` node `5:10` (Profile Relaxed / Balanced / Challenging; matches in-app labels). Replace with live sim capture when a development build is available | Difficulty that fits you |

Shots 1–6 are present on both platforms:

- `ios/1-result.png`, `android/1-result.png`
- `ios/2-share-card.png`, `android/2-share-card.png`
- `ios/3-habit.png`, `android/3-habit.png`
- `ios/4-skills.png`, `android/4-skills.png`
- `ios/5-exercise.png`, `android/5-exercise.png`
- `ios/6-difficulty.png`, `android/6-difficulty.png`

Honesty notes:

- Shots 1–2 remain Figma Focus Snapshot Result + Share Card exports.
- Shot 3 is the existing Today session art (5-min habit); refresh later if #4 tomorrow-preview / Focus Snapshot CTAs should be visible.
- Shot 6 is the Figma Profile difficulty frame (matches in-app labels); replace with a live sim capture when a development build is available.

Do not use generic puzzle collage frames as hero shots. Prefer result + share + habit.

Legacy files (`1-today.png`, `2-practice.png`, `3-progress.png`, `4-exercise.png`, plus iOS Simulator captures) stay in place.
