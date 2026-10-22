# Netherworld Bakery

A complete, short, single-player narrative puzzle RPG prototype. You are Rowan, a male baker starting over in the whimsical village of Bramblewick. Original SVG illustrations, a quiet autumn palette, and no clock to race.

## Run locally

Requires Node.js 22.12+ (22.x), 24.x, or 26+ for the current test tooling.

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

Start a story, read the introduction, then click the cash register in the illustrated bakery to open service. Prepare two orders with three tactile stages: shape, bake, and finish. Follow the hand and arrow to roll, fold, or press the dough, or use the equivalent action button. Start the oven and take your pastry out in the generous golden window; Gentle oven takes it out automatically. Paint or tap the requested topping directly onto the pastry, covering any three of five marked sections. Each stage visibly changes your food. Four recipes rotate across days, including a cinnamon roll. Results explain your quality stars and show a customer reaction; collect payment once to continue. Every result pays.

After your two customers, the bakery becomes interactive again. Click the front door to visit town or click an NPC portrait in the room to start a conversation. Each afternoon has **one** activity: spend time with Orin or Lucien, or visit one of three town locations. At a location, inspect objects for coins, investigate a puzzle, and return home. Visits consume the afternoon immediately, but you can inspect all objects and retry puzzles during that visit. The tower and library mysteries complete the two journal quests. The square has a third deduction puzzle. Hints cost a separate coin; each puzzle offers three. Inspect objects and ask a neighbor for one daily coin to replenish them.

In the evening, click the enchanted oven to buy upgrades, review your journal from the HUD, or click the illustrated bed to advance the day. Two good batches and occasional puzzle rewards fund steady progress. Four upgrades bring the bakery to level 5 and add per-order bonuses.

Relationships have five levels. Explicit date/kiss choices express romantic interest; friendship alone never starts romance. Orin stops at level 3 until the bell quest is complete. A romantic visit at level 5 completes a heart event. When a level-5 bakery and completed romantic route align, an optional evening NPC marker schedules that character’s ending for the next morning. Bed always remains available. Both routes can be eligible independently.

## Saves and controls

Actions automatically save to browser localStorage, including the current location, opening beat, relationship dialogue beat, and unfinished cooking session. Saves from the first iteration load with a default bakery scene. Settings & save (or the save icon in the top bar) writes a separate manual slot. “Load saved chapter” prefers that manual slot; Continue resumes the current automatic story. Save manually before choosing an ending to preserve an earlier chapter. Reset requires confirmation and keeps the manual save. Save formats are versioned and malformed or unsupported records fall back to a fresh story.

All actions use keyboard-accessible native controls; bell placement uses buttons instead of dragging. Cooking supports pointer-captured mouse/touch shaping and freehand topping placement. Action buttons and five decoration section buttons provide equal-scoring keyboard alternatives. There is no overall time limit; only the oven advances in real time while running. Pause it yourself, use Gentle oven, or leave/close the kitchen to suspend it. Hidden tabs pause the oven automatically. Close/reopen or reload to resume shaping, heat, decoration, or an unpaid result. Number keys 1–6 select visible story choices; Enter/Space reveals flowing text before advancing a Continue beat when a button is not focused. Tab and Enter work on every action. Escape dismisses overlays; overlay focus is trapped and restored. Animations respect reduced motion. Small screens use a compact floating menu rail. Typography uses optional Google Fonts with system fallbacks. No game artwork is downloaded.

Development builds expose Settings → Developer tools to add money/hint coins or unlock both endings. These controls are excluded from production builds.

## Architecture and content extension

- `src/game/data.ts`: typed recipe, character, quest, location, puzzle, and upgrade definitions.
- `src/game/rules.ts`: immutable economy, daily progression, relationship gating, quest rewards, hints, ending eligibility, and save parsing.
- `src/game/store.ts` and `persistence.ts`: Zustand state and separate automatic/manual persistence, with storage failure handling.
- `src/game/conditions.ts`, `dialogue.ts`, and `exploration.ts`: shared prerequisite evaluation, authored branching relationship events, and discovery rules.
- `src/minigames/Baking.tsx`: tactile shaping, oven, direct decoration, and scored customer serving screen.
- `src/minigames/baking/`: recipe-specific gestures, quality/coverage rules, validated session persistence, oven pause/animation hook, pastry SVGs, and styling.
- `src/minigames/stacking/`: legacy geometry and scoring retained to migrate unpaid results from older saves. The stacking interface is retired.
- `src/minigames/Puzzle.tsx`: shared puzzle shell, retries, hints, rewards, plus three interaction types.
- `src/components/Art.tsx`: original replaceable SVG backgrounds, portraits, and pastry art.
- `src/App.tsx`: navigation, scene composition, activity dialogs, menus, and ending scenes.
- `src/components/novel/`: illustrated scene staging, character sprites, the dialogue/action dock, accessible overlay focus management, and the system menu.
- `src/game/scenes.ts`: scene identities, authored opening beats, daily narration, and the saved scene cursor.
- `src/game/bakeryRoom.ts`: normalized room hit regions, object descriptions, service start rules, and phase guards.
- `src/components/novel/BakeryRoom.tsx`: original illustrated room and mouse/touch/keyboard object interactions.
- `src/components/GameViews.tsx`: quest journal, relationships, recipe book, and upgrade overlays.
- `src/style.css`: responsive presentation and reduced-motion rules.
- `src/game/rules.test.ts`: economy, immutable transitions, daily activity limits, prerequisites, endings, hints, puzzle solution verification, and save handling.

Add recipes to `recipes`, then define their shaping gestures and decoration zones in `baking/session.ts` and their pastry silhouette/details in `baking/PastryCanvas.tsx`. Quality maps three stage points to the existing 12–24 coin payout plus equipment bonuses. Add puzzle definitions with three ordered hints and a verified answer, and implement a corresponding interaction in `PuzzleInputs.tsx`, selected by the shared `Puzzle.tsx` shell. Add a location referencing that puzzle. Add quests with an objective, location, and reward; reference its puzzle ID; `solve` derives quest completion flags from the definitions. Add dialogue events to `dialogue.ts` with ordered prerequisite conditions; the last eligible event is selected. Event IDs and explicit date choices are remembered in persistent flags. Upgrades are sequential definitions; bonuses derive from bakery level. Replace the SVG art components to introduce commissioned assets without changing game logic.

## Prototype limits

Dialogue and heart events are intentionally brief. Cooking uses original SVG work surfaces and pastry art, three forgiving shaping gestures per recipe, a short oven challenge, and direct decoration. Pointer gestures and keyboard actions earn the same quality. Fine-grained shaping is stylized rather than a dough simulation, and recipes share the oven and decoration rules. Timing and session length need player feedback. Old unfinished stacks restart at preparation; old unpaid results retain their earned score. There are no audio assets yet. Quest advancement is a single puzzle milestone per quest; adding larger quest graphs and longer dialogue trees is the next architectural step. Progression rules are modular, while scene orchestration remains in App. Saves are local to this browser and are not cloud-synced.

## Interactive bakery and visual novel presentation

The bakery is a clickable SVG room, with large hit regions aligned to the illustrated objects. Mouse, touch, and keyboard focus all use the same native buttons; “Show interactions” reveals object labels. The original artwork is replaceable, with normalized object positions and hit regions in `src/game/bakeryRoom.ts`.

- **Cash register:** start the work day, or resume service without resetting orders.
- **Oven:** bake during active service; otherwise inspect bakery improvements. Purchases are available in the evening.
- **Mixing table:** prepare an active customer order, or browse recipes while off duty.
- **Recipe shelf:** open the recipe book.
- **Front door:** leave for town during your one free afternoon activity. It explains the phase requirement at other times.
- **Bed:** sleep in the evening. Earlier visits explain what remains to do.
- **Orin / Lucien portraits:** begin a bakery conversation in the afternoon. Completing the friendship/date choice consumes that day’s activity; politely leaving the conversation does not. Eligible evening portraits schedule the optional ending for tomorrow.

Conversations use a coral, angled speaker tab, a dark bottom dialogue panel, and floating blue-text choices inspired by the supplied visual novel reference. Original placeholder characters and scenery remain independent of the reference artwork. Returning from work or a completed activity restores the clickable room. Cooking and puzzles retain their own accessible overlays.

The saved work-start flag prevents payouts before opening the register. Service progress, current room, location, and dialogue beat persist across reloads; older saves receive compatible defaults. Daily work, one afternoon activity, economy, puzzles, route prerequisites, and optional endings remain action-based. Audio is not implemented.

## Browser checks

```sh
npx playwright install chromium
npm run test:browser
```

The browser runner starts its own Vite server on port 4175, runs all six checks, then stops that server. Port 5173 can keep serving your development game.

- `tests/smoke.mjs`: two complete baking sessions, exploration, hints, tower puzzle, quest reward, upgrade, save, sleep, reload, and mobile overflow.
- `tests/routes.mjs`: the other two puzzles, quest-gated relationship, explicit romance, both scheduled endings, and earlier-save recovery.
- `tests/novel.mjs`: numbered choices, opening/conversation save resume, overlay focus trapping and Escape, friendship choice, mobile settings, and mobile cooking.
- `tests/room.mjs`: actual illustrated appliance hit regions, register gating/resume, room NPC conversations, afternoon restrictions, bed progression, and mobile keyboard interactions.
- `tests/baking.mjs`: pointer/touch shaping, wrong gestures, direct paint, undo/clear, oven pause/resume, assisted baking, result persistence, keyboard quality, exactly-once payments and day progression.

- `tests/presentation.mjs`: protagonist/partner staging, text pacing, conversation log shortcut isolation, and responsive dialogue bounds.

Screenshots are written to `artifacts/`. Unit tests also simulate a complete five-day route using normal economy rules and verify compatibility with the first iteration’s saves. GitHub Actions runs unit checks, TypeScript/build, and browser checks on pushes and pull requests; it does not deploy.
