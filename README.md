# Netherworld Bakery

A complete, short, single-player narrative puzzle RPG prototype. You are Rowan, a male baker starting over in the whimsical village of Bramblewick. Original SVG illustrations, a quiet autumn palette, and no clock to race.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). No backend, account, or deployment is required.

```sh
npm test
npm run build
npm run preview
```

## How to play

Start a story, read the introduction, and bake two orders. Select a base, filling, and finishing ingredient matching the recipe; start and stop the oven in the green zone; add decorations and serve. Every result pays. The recipes rotate across days.

Each afternoon has **one** activity: spend time with Orin or Lucien, or visit one of three town locations. At a location, inspect objects for coins, investigate a puzzle, and return home. Visits consume the afternoon immediately, but you can inspect all objects and retry puzzles during that visit. The tower and library mysteries complete the two journal quests. The square has a third deduction puzzle. Hints cost a separate coin; each puzzle offers three. Inspect objects and ask a neighbor for one daily coin to replenish them.

In the evening, buy upgrades on the bakery screen, review your journal, or go to bed. Two good batches and occasional puzzle rewards fund steady progress. Four upgrades bring the bakery to level 5 and add per-order bonuses.

Relationships have five levels. Explicit date/kiss choices express romantic interest; friendship alone never starts romance. Orin stops at level 3 until the bell quest is complete. A romantic visit at level 5 completes a heart event. When a level-5 bakery and completed romantic route align, an optional evening choice schedules that character’s ending for the next morning. Bed always remains available. Both routes can be eligible independently.

## Saves and controls

Actions automatically save to browser localStorage. Settings & save (or the save icon in the top bar) writes a separate manual slot. “Load saved chapter” prefers that manual slot; Continue resumes the current automatic story. Save manually before choosing an ending to preserve an earlier chapter. Reset requires confirmation and keeps the manual save. Save formats are versioned and malformed or unsupported records fall back to a fresh story.

All actions use keyboard-accessible native controls; bell placement uses buttons instead of dragging. Escape dismisses activity dialogs. Animations respect reduced motion. Small screens use bottom navigation. Typography uses optional Google Fonts with system fallbacks. No game artwork is downloaded.

Development builds expose Settings → Developer tools to add money/hint coins or unlock both endings. These controls are excluded from production builds.

## Architecture and content extension

- `src/game/data.ts`: typed recipe, character, quest, location, puzzle, and upgrade definitions.
- `src/game/rules.ts`: immutable economy, daily progression, relationship gating, quest rewards, hints, ending eligibility, and save parsing.
- `src/game/store.ts` and `persistence.ts`: Zustand state and separate automatic/manual persistence, with storage failure handling.
- `src/game/conditions.ts`, `dialogue.ts`, and `exploration.ts`: shared prerequisite evaluation, authored branching relationship events, and discovery rules.
- `src/minigames/Baking.tsx`: independent three-stage cooking interaction; replaceable without changing payout rules.
- `src/minigames/Puzzle.tsx`: shared puzzle shell, retries, hints, rewards, plus three interaction types.
- `src/components/Art.tsx`: original replaceable SVG backgrounds, portraits, and pastry art.
- `src/App.tsx`: navigation, scene composition, activity dialogs, menus, and ending scenes.
- `src/components/BakeryDashboard.tsx` and `GameViews.tsx`: bakery, town, journal, relationships, recipe book, and upgrade screens.
- `src/style.css`: responsive presentation and reduced-motion rules.
- `src/game/rules.test.ts`: economy, immutable transitions, daily activity limits, prerequisites, endings, hints, puzzle solution verification, and save handling.

Add recipes to `recipes`, keeping base/filling/topping names distinct; the ingredient UI derives its options from those definitions. Add puzzle definitions with three ordered hints and a verified answer, and implement a corresponding interaction in `PuzzleInputs.tsx`, selected by the shared `Puzzle.tsx` shell. Add a location referencing that puzzle. Add quests with an objective, location, and reward; reference its puzzle ID; `solve` derives quest completion flags from the definitions. Add dialogue events to `dialogue.ts` with ordered prerequisite conditions; the last eligible event is selected. Event IDs and explicit date choices are remembered in persistent flags. Upgrades are sequential definitions; bonuses derive from bakery level. Replace the SVG art components to introduce commissioned assets without changing game logic.

## Prototype limits

Dialogue and heart events are intentionally brief. Baking uses three stylized SVG pastry illustrations. There are no audio assets yet. Quest advancement is a single puzzle milestone per quest; adding larger quest graphs and longer dialogue trees is the next architectural step. Progression rules are modular, while scene orchestration remains in App. Saves are local to this browser and are not cloud-synced.

## Browser checks

With `npm run dev` running in another terminal:

```sh
npx playwright install chromium
node tests/smoke.mjs
node tests/routes.mjs
```

The first check plays two full baking sessions, explores, buys a hint, solves the tower puzzle, buys an upgrade, saves, sleeps, reloads, and checks a mobile viewport. The second exercises the other two puzzles, relationship gating, explicit romance, both scheduled endings, and recovery of an earlier manual save. Screenshots are written to `artifacts/`. Unit tests also simulate a complete five-day route using normal economy rules.
