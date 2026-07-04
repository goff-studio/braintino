# Braintino 🧠✨

**Daily Brain Puzzles — Tiny games. Big focus.**

Braintino is a cozy, premium brain-puzzle game built with React Native and Expo.
Help **Tino**, a friendly little guide, restore a colorful mind island by playing
short daily puzzles that challenge your focus, memory, speed, and attention.

> Braintino is a puzzle game for entertainment and mental engagement. It is not a
> medical device and does not diagnose, treat, cure, or prevent any disease.

## Features

- **Daily Brain Boost** — a themed set of 3 short puzzles every day (4–7 minutes)
- **Six mini-games** across cognitive-training-inspired domains:
  - ⚡ **Focus Flash** — visual speed & peripheral attention (Focus Lighthouse)
  - 🗺 **Route Recall** — spatial navigation & route memory (Island Trails)
  - 🌸 **Pattern Garden** — working memory & sequences (Memory Garden)
  - 🎨 **Color Switch** — Stroop-style focus control (Color Dock)
  - 🔀 **Signal Shift** — attention switching & flexibility (Signal Tower)
  - 🧺 **Market Memory** — practical memory & shopping lists (Market Path)
- **Adaptive difficulty** — levels 1–50 per game, always gentle, never shaming
- **Progress Island** — streaks, stars, XP, rank titles, and skill balance
- **Cosmetics** — earn coins to dress Tino in hats and scarves (no purchases, no ads)
- **Accessibility first** — relaxed mode, bigger text, reduced motion, high contrast,
  large tap targets, and color-plus-icon feedback everywhere
- **Fully offline** — no accounts, no backend; progress saved locally

## Tech stack

Expo SDK 57 · React Native 0.86 · TypeScript (strict) · expo-router ·
react-native-reanimated 4 · Zustand · AsyncStorage · expo-audio · expo-haptics

## Getting started

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, or `w` for web.

## Project structure

```
src/
  app/            # expo-router screens (tabs, onboarding, daily, play, results)
  components/     # shared UI (Tino mascot, buttons, cards, stars, rings…)
  constants/      # colors, typography, spacing, game tuning
  data/           # mini-game configs, daily plans, cosmetics, ranks
  game/
    engines/      # scoring, difficulty, daily training, session flow
    miniGames/    # the six playable games
  services/       # storage, audio, haptics, monetization docs (no ads shipped)
  store/          # Zustand store (progress + settings, persisted)
  types/          # shared TypeScript types
  utils/          # seeded random, dates, math
```

Sounds and app icons are generated programmatically (small WAV chimes, PNG icons) —
see `assets/sounds` and `assets/images`.
