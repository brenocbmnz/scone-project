# Four pastry minigames and bakery menu progression

Branch: `feature/pastry-minigames`. All preceding work is merged into `main` at `78778c5`.

## Design

Each order uses one signature challenge followed by its finished pastry, quality stars and customer reaction. There is no repeated shaping/oven/decorating sequence. The existing illustrated kitchen, original SVG pastry art and two-customer day remain.

| Bakery level | New recipe | Challenge |
| --- | --- | --- |
| 1 | Emberheart Bun | Six rhythm kneads, with a shrinking ring, tone cues and generous hit windows. |
| 2 | Moonberry Crescent | Arrange three dough pieces into outlines and rotate their pointed ends into alignment. Mouse/touch drag, click placement, undo and reset. |
| 3 | Ghostlight Tart | Watch four ingredient bowls glow, then repeat their order. Free replays and persistent partly-filled tarts. |
| 4 | Cinnamon Roll | Pipe a visible icing trail along a broad spiral. Lift and continue; keyboard section controls achieve equivalent coverage. |
| 5 | Occasional bakery sampler | Two different unlocked pastries for one customer, packed and paid together. |

Recipe unlocks and their signature games are visible in the recipe book. Equipment descriptions show the next menu unlock. Customer requests are drawn from the unlocked menu; the level never forces additional customers. Every third day/order combination at level five offers a sampler. Existing unpaid legacy orders are honored even if their recipe would now be locked.

## References

The implementation adapts generic mechanics rather than copying artwork, music or code:

- [Rhythm Heaven — Nintendo](https://www.nintendo.com/us/whatsnew/get-ready-to-use-your-ears-in-rhythm-heaven-groove/): beat-based button presses inform the bun's kneading rhythm.
- [Osmo Tangram guide](https://assets.playosmo.com/static/downloads/GettingStartedWithOsmoTangramEdu.pdf): piece placement, silhouettes and visual guidance inform the crescent puzzle.
- [Simon — Hasbro](https://instructions.hasbro.com/en-us/instruction/simon-game): observing and repeating a sequence informs the tart's glowing ingredient bowls.
- [WarioWare: Touched! manual](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_ds_21/Manual_NintendoDS_WarioWareTouched_EN.pdf): distinct touch gestures inform spiral piping and direct manipulation.
- [Cooking Mama: Sweet Shop — Nintendo](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-games/Cooking-Mama-Sweet-Shop-1219665.html): varied sweet-making activities inform the overall collection.

These are design interpretations of published descriptions, not claims about the reference games' internal implementation.

## Controls and assistance

Each game has an introduction with its rule and controls. Touch taps activate on release and suppress delayed duplicate clicks. Native buttons retain keyboard operation. Piping additionally supports the right arrow on its section control; rhythm accepts Space/Enter when a control is not already focused.

Helping hand widens rhythm timing, labels puzzle outlines/rotations, keeps the memory recipe visible, or broadens the piping tolerance. Rewards remain equivalent. Sound can be toggled and its preference is saved. The rhythm and memory cues are original synthesized tones, with visual equivalents; reduced motion disables decorative animation.

## Quality, persistence and payment

- Rhythm: 5–6 hits earn 3 stars, 3–4 earn 2, 1–2 earn 1. Early extra taps do not consume a beat.
- Puzzle: one star per correctly positioned and rotated piece; corrections have no penalty.
- Memory: four correct ingredients complete the tart; up to one mix-up still earns 3 stars. Replays are free.
- Piping: 80% coverage earns 3 stars, 50% earns 2, 20% earns 1. Starting at the center cannot skip the spiral.
- Payment: each pastry pays 12 base coins, 4 per star and the existing equipment bonus. A sampler sums both values and consumes one customer only when collected. Packed scores survive reload.

The `pastry-v1` draft stores the current recipe group, packed results and bounded game progress. Rhythm running state and memory playback are transient: leaving suspends the rhythm and reopening can replay the memory recipe. Rhythm clock checkpoints every 200 ms; input actions save immediately. A draft identity guard prevents a closing component from overwriting a newly loaded chapter or paid order.

Completed unpaid tactile/stacking results retain their old score. Older unfinished cooking drafts restart at the matching recipe's new introduction; money, story and day progression remain intact.

## Validation

`npm test`, `npm run build`, and `npm run test:browser` cover menu gates, rhythm judgement and suspension, puzzle geometry/swapping, observed memory playback, spiral progression and keyboard equivalence, malformed saves and migration, sampler persistence and exactly-once payment, real mouse/touch controls, mobile bounds and all existing narrative routes.

The art is stylized SVG and the sound is a small set of synthesized cues. This is a playable iteration for feedback on timing, puzzle readability and session length, not finished production artwork or an authored musical soundtrack.
