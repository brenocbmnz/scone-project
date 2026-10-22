# Cooking overhaul: tactile bakery microgames

Branch: `feature/cooking-overhaul`. The previous cooking and VN presentation branches are merged into `main` at `2bf7b6d`. The user selected tactile cooking actions over a pure timing game or ingredient puzzle.

## Research

These observations come from published sources, not a hands-on playthrough. Proposed applications are design judgments.

| Reference | Evidence | Application |
| --- | --- | --- |
| [Robin Morningwood — Gayming review](https://gaymingmag.com/2021/03/gayme-of-the-week-robin-morningwood-adventure-is-as-nsfw-as-it-sounds/) | Describes sigil memory, shape-fitting and woodchopping minigames. | Give each activity a simple, distinct physical rule, rather than one elaborate simulation. Keep the work connected to the village and its characters. |
| [Robin Morningwood — developer update 2.0.4](https://grizzly-gamer-studio.itch.io/robin-morningwood-adventure/devlog/699525/game-update-204) | Explicitly reworks Aim click responsiveness and fixes repeated losses from multiple hits in dodge minigames. | Response to input and one outcome per action matter more than extra mechanics. In our game, gestures commit once and collecting pays once. This source does not document the exact woodchopping controls. |
| [Cooking Mama 2 — Nintendo](https://www.nintendo.com/en-gb/Games/Nintendo-DS/Cooking-Mama-2-270341.html) | Describes short cooking challenges using stirring, slicing and simmering with the stylus. | The closest match: manipulate the food, then see a concrete change. Recipe-specific shaping gestures use mouse/touch and equivalent action buttons. |
| [WarioWare: Move It! — Nintendo](https://www.nintendo.com/us/store/products/warioware-move-it-118742/) | Describes lightning-fast microgames, each based on an identifiable motion. | Borrow clear one-action instructions and compact play areas. Do not borrow its frantic pace or mandatory motion hardware. |
| [Rhythm Heaven Groove — Nintendo](https://www.nintendo.com/us/store/products/rhythm-heaven-groove-switch/?slug=rhythm-heaven-groove-switch) | Describes button presses timed to the beat. | A viable alternate direction for an oven or festival activity, but not the primary cooking loop selected by the user. Proper rhythm play would also need authored audio and latency tuning. |

## Why replace stacking

The old design asks players to manage ingredient tabs, drag initiation, collision geometry, release position, settling, support and recipe matching. The visible action is assembling a tower, not baking a pastry. Making the physics more accurate does not remove that interaction burden.

## Implemented loop

1. **Shape.** Three short, recipe-specific gestures. Crescent: roll and curl two tips. Bun: fold two edges and seal. Tart: press two rims and smooth filling. Cinnamon roll: spread cinnamon, roll and tuck. Start at a hand marker and follow a broad direction; no precise tracing or speed requirement. Each completed action changes the dough. An explicit action button provides equivalent keyboard access and scoring.
2. **Bake.** A one-way seven-second progression changes the actual pastry from pale to golden to toasted. The ready window spans 40–96% (roughly 3.9 seconds); 58–82% is the best visual bake. Manual pause and automatic suspension on hidden tabs/closing/reload. Gentle oven takes the pastry out at 70% automatically. There is no overall countdown, lost order or unpaid failure.
3. **Finish.** Apply the recipe's topping directly to the pastry: star sugar, cinnamon dust, pearls or colored sprinkles. Freehand painting or tapping; five target buttons support keyboard/touch precision. Cover any three sections for the finish point. Repeating one section does not inflate the score. Undo and clear remain available before serving.
4. **Serve.** Show the exact pastry, quality breakdown, customer reaction and payout. Collect once. Existing two-order/day rules and 12–24 coin base payouts plus equipment bonuses stay unchanged.

The default finish tool is already the requested topping. Selecting it again from a pantry would add a redundant step. Ordinary orders test handling, not reading back ingredient labels.

## Persistence and compatibility

Tactile drafts have a `kind: tactile-v1` discriminator, bounded coordinates, validated phase progression, shaping count, heat, bake rating, decoration marks and assist preference. The oven's running state is deliberately transient, so loading never silently advances or burns food.

Legacy completed/unpaid stacks migrate to a result with their original payout score. Legacy unfinished stacks restart at shaping for the same recipe; story, money and order counts remain intact. Legacy collision/scoring code remains only to interpret those saves. New gameplay has no collision engine.

## Verification and limits

Unit checks cover gesture geometry, generous bake thresholds, coverage scoring, malformed drafts and old-save migration. Browser checks exercise real mouse/touch gestures, keyboard alternatives, pause/resume, direct decoration, uncollected results, duplicate payment protection, day progression and mobile overflow. The rest of the suite still covers exploration, romance/endings, saves, overlays and VN presentation.

This is a playable prototype for feedback. The illustrations and shaping deformation are stylized SVGs, not deformable dough. A future polish pass can add richer hand/tool poses, sound effects and recipe-specific finishing patterns. Target roughly 20–35 seconds per familiar order; this is a design target, not a measured player-study result.
