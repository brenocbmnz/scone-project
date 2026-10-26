# Runtime performance repair

Branch: `fix/game-runtime-performance`, based on the four-pastry minigames branch. No engine/framework migration or save-format change.

## Findings and changes

The previous rhythm animation updated React state every animation frame. Autosave checkpoints also notified the whole app, recreating static SVG scenes. Cooking ran over a blurred, animated full-screen backdrop, and the room duplicated its illustration as a blurred background. The rhythm clock clamped frame deltas to 80 ms, stretching time whenever rendering stalled.

- A dedicated frame callback now owns the rhythm ring, readiness prompt and audio cue. React renders discrete input/results rather than every clock tick. Autosave checkpoints, pause and recovery remain intact.
- The clock follows elapsed foreground time. A late frame records missed beats rather than slowing the game. Hidden tabs still pause it.
- Background scenes stop animating and leave the compositor while a modal owns the screen. Full-screen backdrop blur is replaced with a solid dark backing.
- Static scene/room illustration components are memoized. The duplicate room backdrop is hidden, and the hearth opacity effect updates in a gentle stepped flicker.
- Rejected/no-op store actions no longer serialize a save or notify React subscribers.

## Controlled comparison

Production builds, Chromium headless, 1440×900 viewport, identical 4× CPU throttling, 4.51-second cooking samples, run sequentially. Baseline is commit `db9d365`. These are measurements on this machine, not guarantees for another browser/device.

| Metric | Baseline | Optimized |
| --- | ---: | ---: |
| Animation frames | 59 | 271 |
| Average frame rate | 13.1 fps | 60.1 fps |
| 95th percentile frame interval | 100 ms | 16.8 ms |
| Frames over 50 ms | 56 | 0 |
| React root commits | 59 | 25 |
| Autosave writes | 19 | 22 |
| Time inside storage writes | 5.7 ms | 6.4 ms |

Storage was not the dominant cost in this measurement. Rendering/compositing and coupling the visual clock to UI updates were the useful targets. Retaining saves matters more than reducing their small measured cost.

Run `CPU_RATE=4 GAME_URL=http://localhost:5173 npm run benchmark` against a running build. For a fair comparison, use production preview servers for both revisions and avoid running browser tests simultaneously. The benchmark reports observations rather than brittle CI frame-rate thresholds.

## Validation and engine direction

Unit checks cover no-op store behavior and normal immediate persistence. Browser checks include a deliberately delayed animation frame, rhythm pause/resume, all four games, saves, single sampler payment, native touch, keyboard and narrative routes.

For a future browser engine migration, [Phaser](https://www.phaser.io/oss/docs) provides a dedicated 2D Canvas/WebGL game layer while the current React dialogue/menus can be retained. That is an architectural option, not part of this fix or a prerequisite for the measured improvement. More art/animation-heavy scenes may justify that renderer later.
