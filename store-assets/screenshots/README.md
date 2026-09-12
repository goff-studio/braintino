# Store screenshots

Shot list and captions live in [`../store-listing.md`](../store-listing.md) (source of truth).

Figma: https://www.figma.com/design/ws3siWmGHVRfkt3awyKGBz  
Frames: `iPhone / Result` (node `1:2`), `Share Card / 1080` (node `1:39`)

## Locked export / shoot order (iOS + Android)

Drop files into `ios/` and `android/` in this order. First three captions are OCR-indexed on iOS.

| # | Shot | File | Status | Figma / source | Caption |
|---|---|---|---|---|---|
| 1 | Result card | `1-result.png` | Present | Figma Focus Snapshot Result (`iPhone / Result` node `1:2`; sample: score 78, band Clear focus, bars focus/speed/consistency, dual disclaimer) | Know your focus score |
| 2 | Share card | `2-share-card.png` | Present | Figma Focus Snapshot Share Card (`Share Card / 1080` node `1:39`; branded share crop) | Share your brain score |
| 3 | 5-min habit | `3-habit.png` | Present | Existing Today 5-min session art; refresh later if #4 tomorrow-preview / Focus Snapshot home CTAs should show | Five minutes a day |
| 4 | Skill chart | `4-skills.png` | Present | Progress / Skill Balance | See what improved |
| 5 | Calm adult practice | `5-exercise.png` | Present | Processing Speed exercise in progress | Built for adults |
| 6 | Adaptive difficulty | `6-difficulty.png` | Present | Figma Profile difficulty frame matching in-app labels; replace with live sim when a development build is available | Difficulty that fits you |

Shots 1–6 are present on both platforms:

- `ios/1-result.png`, `android/1-result.png`
- `ios/2-share-card.png`, `android/2-share-card.png`
- `ios/3-habit.png`, `android/3-habit.png`
- `ios/4-skills.png`, `android/4-skills.png`
- `ios/5-exercise.png`, `android/5-exercise.png`
- `ios/6-difficulty.png`, `android/6-difficulty.png`

### Honesty notes

- Shots 1–2: Figma Focus Snapshot Result + Share Card (already on `new-design`)
- Shot 3: existing Today 5-min session art; refresh later if #4 tomorrow-preview / Focus Snapshot home CTAs should show
- Shot 6: Figma Profile difficulty frame matching in-app labels; replace with live sim when a development build is available

Do not use generic puzzle collage frames as hero shots. Prefer result + share + habit.

Legacy files (`1-today.png`, `2-practice.png`, `3-progress.png`, `4-exercise.png`, plus iOS Simulator captures) stay in place as archive/reference. Do not delete them.
