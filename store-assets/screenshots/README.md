# Store screenshots

Shot list and captions live in [`../store-listing.md`](../store-listing.md) (source of truth).

Figma: https://www.figma.com/design/ws3siWmGHVRfkt3awyKGBz  
Frames: `iPhone / Result` (node `1:2`), `Share Card / 1080` (node `1:39`)

## Locked export / shoot order (iOS + Android)

Drop files into `ios/` and `android/` in this order. First three captions are OCR-indexed on iOS.

| # | Shot | File | Status | Figma / source | Caption |
|---|---|---|---|---|---|
| 1 | Result card | `1-result.png` | Exported (Figma 3x PNG) | `iPhone / Result` node `1:2` (sample: score 78, band Clear focus, bars focus/speed/consistency, dual disclaimer) | Know your focus score |
| 2 | Share card | `2-share-card.png` | Exported (Figma 3x PNG) | `Share Card / 1080` node `1:39` (branded share crop) | Share your brain score |
| 3 | 5-min habit | — | Pending | Today / daily session ~5 min + streak (calm adult UI) | Five minutes a day |
| 4 | Skill chart | — | Pending | Weekly balance across skills | See what improved |
| 5 | Calm adult practice | — | Pending | One exercise in progress, no cartoons | Built for adults |
| 6 | Adaptive difficulty | — | Pending | Relaxed / Balanced / Challenging | Difficulty that fits you |

Shots 1–2 are present on both platforms:

- `ios/1-result.png`, `android/1-result.png`
- `ios/2-share-card.png`, `android/2-share-card.png`

Do not use generic puzzle collage frames as hero shots. Prefer result + share + habit.

Legacy files (`1-today.png`, `2-practice.png`, `3-progress.png`, `4-exercise.png`, plus iOS Simulator captures) stay in place until shots 3–6 are exported.
