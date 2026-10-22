# Cooking minigame review and proposed direction

Status: research and design proposal, October 22, 2026. No cooking mechanics changed by this review.

Branch: `feature/cooking-minigame`. The approved visual novel / interactive bakery iteration is merged into `main`.

## What is weak in the current version

Reviewed `Baking.tsx`, `bakingRules.ts`, the pastry SVGs, recipe definitions, and the existing browser flow. Exercised assembly, the oven, and decoration in Chromium.

1. **Assembly is a form.** Three groups of text buttons copy the three ingredients already printed in the order. The pastry is shown as a finished product from the start. Choosing different ingredients does not change that preview: its shape and filling color are tied to the requested recipe, rather than the player's actual choices.
2. **The oven is disconnected from cooking.** A marker increments every 45 ms and wraps from 100 back to 0. Stopping between 35 and 80 earns a point. The pastry does not gradually brown, and the loop implies that an overbaked pastry becomes raw again. It feels like a generic timing test.
3. **Decoration has no expressive input.** The player clicks one button three times. Stars appear in predetermined positions regardless of the selected topping, and the only scoring condition is a count of at least three. There is no placement, distribution, undo, or visible difference between cinnamon and pearls.
4. **Recipes share one interaction.** The SVG silhouettes differ, but making a bun, tart, and crescent requires identical actions. There is no shaping or handling that communicates what the player is making.
5. **Feedback does not teach.** Three binary points produce a quality label. All ingredient choices share a single point, and the result never explains what worked. Serving returns a generic coin notification rather than a reaction to the actual pastry.
6. **A modal interrupts the room fantasy.** The player clicks an appliance but gets another panel of buttons. Closing it discards unfinished local baking state without an explicit pause or abandon decision.

The problem is primarily interaction design and feedback. Adding more ingredients, harder timing, or more clicks would amplify the same issues.

## References and what they suggest

The descriptions below are drawn from developer/publisher pages. The proposed applications are our design judgments, not claims about how these games implement every detail. This review did not play these reference games or inspect their code.

| Reference                                                                                                               | Supported observation                                                                                                                        | Application to Netherworld Bakery                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Papa's Bakeria — Flipline Studios](https://www.flipline.com/othergames/papasbakeria/index.html)                        | Crust selection, fillings, baking, and a dedicated finishing station form the bakery process.                                                | Use distinct preparation, oven, and decoration views, with the same pastry traveling between them. Keep our fixed two orders and relaxed pacing.                     |
| [Cooking Mama: Cuisine — Apple editorial with director commentary](https://apps.apple.com/us/iphone/story/id1622239753) | Preparation uses actions such as peeling, stirring, and flipping. Gestures support touch/controller play; mistakes do not cause a game over. | Give each recipe one recognizable physical action with generous tolerances and a button/keyboard equivalent. Make mistakes visible and forgiving.                    |
| [Good Pizza, Great Pizza — TapBlaze press kit](https://goodpizzagreatpizza.com/press/)                                  | The game shifts between counter and kitchen, and customer conversations depend on whether the order satisfies them.                          | Carry the order from dialogue to the workbench, then show the customer's response to the actual result. Avoid importing its time pressure or large management scope. |
| [Venba — developer press kit](https://venbagame.com/press/)                                                             | Cooking puzzles reconstruct a damaged recipe book and connect food to an authored family story.                                              | Reserve special recipes for narrative discoveries, memories, and relationship events; ordinary orders should not become repetitive riddles.                          |
| [Magical Delicacy — developer website](https://magicaldelicacy.com/)                                                    | Ingredient attributes affect requests; tools, processing, recipes, and ingredients connect cooking to exploration and progression.           | Later, let a quest unlock a filling or a character teach a recipe. Keep inventory management outside the first cooking revision.                                     |

Best fit: **Papa's Bakeria's station structure, Cooking Mama's direct manipulation, and the counter-to-kitchen story connection of Good Pizza, Great Pizza.** Venba is a useful reference for occasional story recipes. These are design ingredients, not a request to reproduce their assets or whole systems.

## Recommended experience

Aim for roughly **30–60 seconds per order**, subject to playtesting. One pastry and one customer at a time. Preparation and finishing have no countdown.

### 1. Prepare on the actual workbench

Transition from the customer to a close-up of the mixing counter. Keep the order ticket in one corner, a large working area in the center, and illustrated ingredient containers within reach. The ingredients should be objects the player uses, not a form that has to be submitted.

Selecting a base places raw dough or an empty shell on the board. Selecting a filling changes the actual food. Allow correcting ingredient choices before committing to the oven.

Give each recipe one brief, distinct action:

- **Moonberry Crescent:** place the filling, then roll the dough into a crescent.
- **Emberheart Bun:** add apple filling, then fold and seal the bun.
- **Ghostlight Tart:** fill the shell, then smooth the cream.

Pointer/touch actions can feel tactile, but dragging and rapid tapping must not be required. Provide click-to-select/click-to-place controls and explicit Roll / Fold / Smooth actions with the same achievable score.

### 2. Bake something that visibly changes

Put the same pastry on an illustrated oven tray. Show it rise and change from pale dough to golden pastry. Use a one-way bake progression rather than a looping marker.

Start with an approximately 8–12-second bake and a generous ready window. A readable label and optional sound can signal readiness; color alone is insufficient. Give specific feedback for pale, golden, and a little overdone outcomes. No ingredient loss or unpaid order.

Offer an assisted take-out option. Pause the cooking simulation when the tab is hidden, when a pause menu is open, or when the session is suspended. Avoid an extra heat dial or tray-rotation task until the basic oven action is enjoyable; those can become recipe-specific variations later.

### 3. Decorate directly on the pastry

Choose a topping tool and place it on the food:

- Star sugar visibly adds little stars.
- Cinnamon creates a dusted patch or trail.
- Pearls place individual sugar pearls.

Use broad coverage targets, not pixel-perfect tracing or an arbitrary total-click threshold. Allow undo/clear before serving. A keyboard-accessible set of pastry regions can place toppings without dragging, with equivalent scoring.

### 4. Serve and hear back

Show the exact finished pastry, the Homemade / Great / Perfect result, and a brief explanation of recipe accuracy, baking, and finishing. Display the payout before collecting it once.

Return to the customer for one short result-dependent line, then continue the existing order/day flow. A perfectly decorated but slightly pale pastry should receive a coherent response rather than a generic success message.

## First implementation slice

Build **one excellent Moonberry Crescent session first**, then extend the interaction vocabulary to the bun and tart.

1. Introduce a small baking-session state machine and a close-up workbench view. Keep recipe content data-driven and presentation separate from evaluation.
2. Make raw dough, filling, shaping, baking, and placed decorations visually observable states of one pastry.
3. Replace the looping heat bar with gradual browning, a ready window, and assisted take-out.
4. Add meaningful decoration placement, undo, a clear result breakdown, and a customer reaction.
5. Pause/resume an unfinished order, including on closing and reopening the workbench. Persist a compact session or explicitly confirm abandoning it; never pay twice or silently reset an order after collecting.
6. Adapt richer internal results to the existing payout contract so cooking changes do not accidentally rebalance bakery upgrades or ending progression.

React, SVG, and CSS remain sufficient for this slice. There is no demonstrated need for Phaser, a physics engine, or additional dependencies.

## How we will judge the next version

- A first-time player can identify the requested pastry and start using ingredients without reading a paragraph of instructions.
- Every meaningful action visibly changes the pastry; the finished food reflects actual ingredient and decoration choices.
- A familiar order fits the short target session length without compulsory idle waiting beyond the brief bake.
- Different recipes have a distinguishable preparation action.
- A player can explain why the result earned its rating.
- Mouse, touch, and keyboard paths can achieve the same top result. Reduced motion and assisted baking remain supported.
- Pausing, leaving the tab, resuming, or reloading does not burn food unexpectedly, lose a completed payment, duplicate money, or skip a customer.
- Two orders still lead to exactly one afternoon activity. Existing quests, romance routes, upgrades, and ending eligibility remain intact.

Test the first vertical slice with real play before committing to more recipes. The exact duration, bake window, and scoring thresholds are tuning proposals, not validated findings about what players find fun.
