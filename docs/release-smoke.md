# Release smoke checklist — 1.6.0 RC

Walk this on a **fresh install** (or Profile → Reset progress) of the 1.6.0 binary. Practice / entertainment only — fail the build if any screen implies a medical, IQ, or ADHD result.

Locale for the main path: **English**. Repeat the locale pass at the end.

Mark each box on device. Re-test after a failed item.

---

## 1. Onboarding (plan builder)

Fresh launch should open the personal-plan flow (`src/app/onboarding.tsx`).

- [ ] **Welcome** — calm adult copy; intro says the plan is for fun / self-insight, **not a diagnosis**.
- [ ] **Goal** — must pick one (Sharpen focus / Remember more / Think faster / Stay flexible / Build a habit). Continue stays blocked until a pick.
- [ ] **Age band** — must pick one, including Prefer not to say. Copy says this only seeds pace — never a score or diagnosis.
- [ ] **Weak spots** — one or more toggles (practice preferences, not symptoms).
- [ ] **Time** — five minutes is already selected; no longer session is offered.
- [ ] **Reminder** — Daily / weekdays / every other day + morning / afternoon / evening. Confirming requests OS permission and schedules a local reminder. **Not now** skips without leaving the flow.
- [ ] **Your personal plan** — title + pace match the answers; plan card shows the entertainment disclaimer.
- [ ] Accessibility drawer (bigger text / reduced motion / high contrast) opens and the toggles persist later in Profile.
- [ ] Exit CTAs all work:
  - **Find My Level** → calibration
  - **Start today’s session** → daily session
  - **Try a Focus Snapshot** → assessment intro (`source=onboarding`)
  - **Skip for now** → Today

For this RC, take **Try a Focus Snapshot** so the next section starts from onboarding.

---

## 2. Focus Snapshot

- [ ] Intro names **Focus Snapshot**, ~90 seconds, and shows the full entertainment disclaimer (`AssessmentDisclaimer`).
- [ ] Start Snapshot plays the short Processing Speed (radar) check. Completing it lands on the result screen.
- [ ] Result shows score / 100, band (Peak / Clear / Solid / Getting started), and Focus / Speed / Consistency bars.
- [ ] Footer / result disclaimer is present: entertainment and personal insight — **not** a medical or diagnostic test.
- [ ] Leaving the result returns to Today (onboarding is already complete).
- [ ] Today and Practice still offer **Take / Retake Focus Snapshot**.

---

## 3. Share / invite

From the Focus Snapshot **result** screen:

- [ ] **Share your snapshot** opens the system share sheet (image of the branded card when capture works; text fallback otherwise). Share text includes the score and **Entertainment only — not a diagnosis.**
- [ ] Share card footer reads **Entertainment only · Not medical advice** (or the locale equivalent).
- [ ] **Challenge a friend** prefills invite copy with both store URLs (App Store `id6787367632`, Play `com.techtory.braintino`) and the entertainment line. Canceling the sheet does not crash.
- [ ] Web-only: if the share sheet is missing, invite text is copied and shown in an alert.

Streak share (can wait until a 7-day streak exists, or skip on a first-run RC):

- [ ] After earning streak **7 / 14 / 30**, session results show Share your streak / Challenge a friend.
- [ ] Progress tab shows the friend-challenge card once the current streak is ≥ 7.

---

## 4. Daily habit

- [ ] Today shows the personal plan (if generated) and **Start Daily Practice** — three exercises, about five minutes.
- [ ] Completing the daily (all three exercises finished) lands on session results: accuracy, practice score, streak save line, **tomorrow preview**.
- [ ] Back on Today: session marked completed, streak incremented, tomorrow’s mix visible, Focus Snapshot still available.
- [ ] Local reminder (if enabled in onboarding or Profile) still exists after the session. Profile can change frequency / time.
- [ ] Killing and reopening the app the same day does **not** offer a second daily; it offers free play / snapshot instead.

---

## 5. Weekly challenge

- [ ] Today and Practice show this week’s challenge card (title, twist, days left, three exercises).
- [ ] **Start weekly challenge** runs the three-exercise mix with the week’s twist (rules switch / reverse & rotate / two cues / list-then-act). Scoring matches daily practice — not a new test.
- [ ] Completing it marks the card **Completed · a new mix lands next week**. Playing again the same week is allowed; it should not look like a first-time completion.
- [ ] Copy stays entertainment / practice — no clinical language.

---

## 6. Free play unlock (after first daily)

Before the first completed daily (onboarding done, level 1):

- [ ] Practice lists some engines locked with **Finish today’s session to unlock**.
- [ ] Daily-plan games that are already at unlock level can still be free-played.

After the first completed daily:

- [ ] Practice copy says **All six exercises are open.**
- [ ] All six engines start a single-exercise session (Processing Speed, Route Memory, Pattern Sequence, Focus Control, Cognitive Flexibility, Practical Memory).
- [ ] Today’s post-daily state offers free play + Focus Snapshot, not a second daily.

Reset progress and confirm the catalog is gated again until the next completed daily.

---

## 7. Locale switch (EN / ES / PT / DE / FR)

Profile → **Language**. Default is **Device default**.

For **each** of English, Español, Português, Deutsch, Français:

- [ ] Tabs (Today / Practice / Progress / Profile) switch immediately.
- [ ] Onboarding strings (or Profile about + plan card if already onboarded) are in that language — not leftover English keys.
- [ ] Focus Snapshot intro + result disclaimer are localized.
- [ ] Daily start CTA and weekly challenge card are localized.
- [ ] Language names themselves stay in the native form (English / Español / Português / Deutsch / Français).

Then:

- [ ] **Device default** follows the OS language (ES/PT/DE/FR map; anything else → English).
- [ ] Relaunch keeps the chosen preference.

Store listing screenshots stay English; this pass is in-app UI only.

---

## 8. Rating ask — only after a successful session

The prompt lives on **daily session results** (`RateAppCard`). Rules: `src/services/review/eligibility.ts`.

Must **not** show:

- [ ] After an incomplete daily, an unfinished exercise, or practice-only / weekly-only results.
- [ ] When session average accuracy is below **70%** (frustrated session).
- [ ] On day 1 when accuracy is under **85%** **and** there is no recent Focus Snapshot ≥ **70**.
- [ ] A second time after **Sure, I’ll rate it** or **Maybe later** (one-shot).

May show:

- [ ] First completed daily with ≥ 85% accuracy, **or** a successful first daily plus Focus Snapshot ≥ 70 (`strong_session_1`).
- [ ] Completed daily on a 2–3 day streak, not frustrated (`early_streak`).
- [ ] A later successful daily if the early window was missed (`successful_session`).

- [ ] Accept opens the native store-review sheet (or no-ops quietly if the OS refuses). Dismiss hides the card and does not return.

---

## 9. Entertainment disclaimers (spot-check)

Fail if any of these are missing or rewritten into medical/IQ/ADHD claims:

| Surface | Expected (EN) |
| --- | --- |
| Onboarding welcome | Fun and self-insight, not a diagnosis |
| Personal plan card | Not a medical, diagnostic, or clinical assessment |
| Focus Snapshot intro | Full disclaimer (not IQ, ADHD, or any health condition) |
| Snapshot result + share card | Short + full entertainment lines |
| Share / invite text | Entertainment only — not a diagnosis |
| Profile → About | Not a medical device; does not diagnose, treat, cure, or prevent |

---

## 10. Sanity (this binary)

- [ ] Profile version string reads **1.6.0**.
- [ ] Cold start, background/foreground, and a short offline stretch do not lose progress.
- [ ] No crash on onboarding → snapshot → daily → practice → weekly → Profile language change.
- [ ] Ads / purchase UI (if shown) still match the existing ad-free IAP — not a new subscription.

---

## Reset between passes

Profile → Reset progress clears onboarding, streak, catalog unlock, and rating-ask memory so the first-run path can be repeated on the same install.
