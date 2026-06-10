# ⚽🎨 Flag Explorer 2026

**Interactive Flag Explorer — World Cup Edition.** *Color your way around the world!*

A kid-friendly flag coloring and geography learning web app that turns World Cup 2026
excitement into learning moments: color all 48 team flags region by region, master
trivia about every country, match flags against the clock, sort countries onto
continents, and follow the real tournament schedule with daily Matchday Challenges.

## ✨ Features

| Area | What's inside |
|---|---|
| 🎨 **Coloring Studio** | All 48 qualified teams as paint-by-region SVG flags. Guided mode teaches the real colors; free-paint mode lets creativity run wild. Stars, confetti and fun facts on completion. |
| 🧠 **Trivia Arena** | Generated questions about capitals, continents, languages, World Cup groups and football lore — with kid-friendly explanations after every answer. |
| 🔎 **Flag Match** | Timed guess-the-flag rounds (10 flags, 12 seconds each). |
| 🗺️ **Continent Quest** | Sort countries onto their continents; transcontinental countries (hi, Türkiye!) accept both answers. |
| ⚽ **World Cup Hub** | The real 12 groups and full 104-match schedule (Canada · Mexico · USA), plus a daily **Matchday Challenge** quiz generated from that day's actual fixtures. |
| 🛂 **Passport** | Country stamps, 13 badges, streaks and stars — progress gamification throughout. |
| 📅 **Daily Challenge** | One seeded quiz per calendar day (same questions for everyone), keeps streaks alive. |
| 🔓 **Freemium tiers** | Starter Pack (12 free flags) → World Explorer $7.99/wk → Pro Unlock $39.99/mo → Family & Classroom $100/yr, with a 3-day trial. **Demo mode: no real payments** — plans unlock locally behind a parent gate. |
| 👨‍👩‍👧 **Grown-ups corner** | Settings, plain-words privacy, educator info, data reset — all behind a COPPA-style parent gate. |

## 🛡️ Built for kids

- **Zero data collection** — no accounts, no analytics, no trackers, no ads. Progress lives in `localStorage` only.
- Parent gate (multiplication check) in front of plans and data controls.
- Reduced-motion support, keyboard/focus accessibility, full offline support via service worker (PWA).

## 🧱 Tech

**Zero dependencies. No build step.** Hand-crafted vanilla ES modules + CSS:

```
index.html            SPA shell
js/main.js            hash router + app chrome
js/state.js           persisted store: streaks, stars, badges, plan gating (pure, testable)
js/flags.js           flag geometry engine — 48 flags described as paintable SVG regions
js/data/teams.js      48 teams + facts (capitals, languages, continents, football lore)
js/data/matches.js    official 104-match schedule
js/games/questions.js trivia generators (pure, testable)
js/views/*            home, coloring, games, world cup, passport, premium, grown-ups
sw.js                 offline-first service worker
```

## 🧪 Tests

```bash
# 33 unit tests (Node's built-in runner, no deps)
node --test 'tests/*.test.mjs'

# Full E2E in headless Chromium (requires playwright):
python3 -m http.server 8123 &
node tests/e2e.mjs        # colors a flag, plays every game, passes the parent gate
```

The E2E run drives every screen, asserts gating (12 free / 36 locked → all 48 after
trial), verifies badge/star awards and fails on any console error. Screenshots land in
`.screenshots/`.

## 🚀 Run / deploy

It's static — serve the folder with anything:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

Deploys as-is to Vercel / Netlify / GitHub Pages (`vercel.json` included with
security headers).

---

*Match data: FIFA World Cup 2026 — 48 teams, 12 groups, 104 matches. Flags are
lovingly simplified for small hands and remain the property of their nations. 🌍*
