# Braintino — Store Listing (ASO)

Source of truth for App Store / Google Play copy. Issue #3 rebuild around Focus Snapshot.

Target keywords: focus test, brain score, attention, memory, concentration, cognitive,
brain training, daily practice, adults, processing speed, mental exercise.

Assessment contract (in-app / share card): `assessment_id` = focus_snapshot, `assessment_name` = Focus Snapshot,
`score` / `score_max`, `band_label` / `band_blurb`, `focus` / `speed` / `consistency`,
`disclaimer_short`, `disclaimer`. Visual frames: Figma `iPhone / Result` + `Share Card / 1080`.

---

## App Store (iOS)

iOS search indexes TITLE + SUBTITLE + KEYWORD FIELD only. The description is for
conversion — the first three lines (above the "more" fold) do the selling.

**Title** (21/30 chars)
```
Braintino: Focus Test
```

**Subtitle** (17/30 chars)
```
Daily Brain Score
```

**Keyword field** (98/100 chars — never repeat words already in title/subtitle)
```
attention,memory,concentration,cognitive,adult,speed,practice,mental,habit,exercise,recall,offline
```

**Promotional text** (162/170 chars — updatable without review, shows above description)
```
Take a quick focus test, get your daily brain score, then practice five minutes a day. Calm adult design — attention, memory, and speed without the cartoon noise.
```

**Description**
```
Know your focus score in under two minutes.

Then keep it sharp with a five-minute daily practice — adapted to you.

Braintino is calm cognitive training for adults: a short focus test, a clear brain score, and daily exercises for attention, memory, and processing speed.

NO CARTOONS. NO ENDLESS LEVELS.
Just a clear result you can share, then short practice that respects your time.

FOCUS SNAPSHOT → DAILY BRAIN SCORE
A ~60–90 second Focus Snapshot: score plus focus, speed, and consistency. Entertainment only — not a medical or diagnostic test.

THEN FIVE MINUTES A DAY
Each session combines three exercises. Difficulty adapts to your accuracy and pace.

SIX FOCUSED EXERCISES
- Processing Speed: react to brief visual cues with accuracy and control
- Route Memory: recall a sequence of locations after a short preview
- Pattern Sequence: hold expanding sequences in working memory
- Focus Control: respond to the rule while ignoring conflicting cues
- Cognitive Flexibility: adapt quickly as the sorting rule changes
- Practical Memory: hold a short list in mind, then act on it

DIFFICULTY THAT ADAPTS TO YOU
Start at an adult baseline and progress quickly when you perform well. Choose Relaxed, Balanced, or Challenging mode — and let the difficulty engine handle the rest.

MEASURE WHAT MATTERS
After every exercise, see your accuracy, response consistency, and Practice Score. Track weekly performance, skill balance, streaks, and milestones on a clean progress dashboard.

BUILT FOR CONSISTENCY
Streaks, levels, and milestones are designed around one habit: showing up daily. Everything works offline, and your data stays on your device.

Braintino is a cognitive practice app for entertainment and personal development. It is not a medical device and does not diagnose, treat, cure, or prevent any condition.
```

---

## Google Play

Play indexes the SHORT and LONG description. Keywords should recur naturally
(2–4 times each) — never stuffed.

**Title** (21/30 chars)
```
Braintino: Focus Test
```

**Short description** (76/80 chars — heaviest-weighted indexed field)
```
Focus test + daily brain score. Short adult practice for attention & memory.
```

**Long description**
```
Know your focus score in under two minutes.

Then keep it sharp with a five-minute daily practice — adapted to you.

Braintino is a brain training app built for adults: a short Focus Snapshot, a clear brain score, and daily cognitive exercises for focus, memory, attention, and mental flexibility. No cartoon characters, no endless levels — just focused practice that respects your time.

FOCUS SNAPSHOT → DAILY BRAIN SCORE
Take a ~60–90 second focus test and see your score plus focus, speed, and consistency. Share your result. Entertainment and self-insight only — not a medical or diagnostic test.

THEN FIVE MINUTES A DAY
Each daily practice session combines three exercises and takes about five minutes. Difficulty adapts to your accuracy and pace, so your brain training stays challenging without becoming stressful.

SIX FOCUSED COGNITIVE EXERCISES
- Processing Speed: react to brief visual cues with accuracy and control
- Route Memory: recall a sequence of locations after a short preview
- Pattern Sequence: hold expanding sequences in working memory
- Focus Control: respond to the rule while ignoring conflicting cues
- Cognitive Flexibility: adapt quickly as the sorting rule changes
- Practical Memory: hold a short list in mind, then act on it

DIFFICULTY THAT ADAPTS TO YOU
Start at an adult baseline and progress quickly when you perform well. Choose Relaxed, Balanced, or Challenging mode — the adaptive difficulty engine handles the rest, exercise by exercise.

MEASURE WHAT MATTERS
After every exercise, see your accuracy, response consistency, and Practice Score. A clean progress dashboard tracks weekly performance, skill balance across memory, focus, attention, speed, and flexibility, plus streaks and milestones.

BUILT FOR A DAILY HABIT
Braintino is designed around one principle: short daily practice beats occasional marathons. Streaks, practice levels, and milestones keep your routine going. Works fully offline; your data stays on your device.

WHO IT IS FOR
Adults who want a quick focus test, a clear brain score, and a consistent five-minute mental exercise routine.

Braintino is a cognitive practice app for entertainment and personal development. It is not a medical device and does not diagnose, treat, cure, or prevent any condition. If you have concerns about memory or attention, consult a qualified healthcare professional.
```

---

## Screenshot shot list (locked to Figma)

Figma: https://www.figma.com/design/ws3siWmGHVRfkt3awyKGBz
Frames: `iPhone / Result` (node `1:2`), `Share Card / 1080` (node `1:39`)

Export / shoot order (iOS + Android). First three captions are OCR-indexed on iOS — keep short and keyword-rich.

1. **Result card** — present (`ios/1-result.png`, `android/1-result.png`). Figma Focus Snapshot Result (`iPhone / Result` node `1:2`; sample: score 78, band Clear focus, bars focus/speed/consistency, dual disclaimer). Caption: `Know your focus score`
2. **Share card** — present (`ios/2-share-card.png`, `android/2-share-card.png`). Figma Focus Snapshot Share Card (`Share Card / 1080` node `1:39`; branded share crop). Caption: `Share your brain score`
3. **5-min habit** — present (`ios/3-habit.png`, `android/3-habit.png`). Existing Today 5-min session art; refresh later if #4 tomorrow-preview / Focus Snapshot home CTAs should show. Caption: `Five minutes a day`
4. **Skill chart** — present (`ios/4-skills.png`, `android/4-skills.png`). Progress / Skill Balance. Caption: `See what improved`
5. **Calm adult practice** — present (`ios/5-exercise.png`, `android/5-exercise.png`). Processing Speed exercise in progress, no cartoons. Caption: `Built for adults`
6. **Adaptive difficulty** — present (`ios/6-difficulty.png`, `android/6-difficulty.png`). Figma Profile difficulty frame matching in-app labels (Relaxed / Balanced / Challenging); replace with live sim when a development build is available. Caption: `Difficulty that fits you`

Do not use generic puzzle collage frames as hero shots. Prefer result + share + habit. Legacy `1-today.png` / `2-practice.png` / `3-progress.png` / `4-exercise.png` stay in place as archive/reference.

## Disclaimer strings (match in-app)
- `disclaimer_short`: Entertainment only · Not a diagnosis
- `disclaimer`: For entertainment and self-insight only. Not a medical, diagnostic, or clinical test — and not a measure of IQ, ADHD, or any health condition.
