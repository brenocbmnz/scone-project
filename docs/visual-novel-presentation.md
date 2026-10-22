# Visual novel presentation pass

Branch: `feature/visual-novel-polish`, based on the cooking branch so playtesting includes drag-and-stack cooking.

## References and direction

The following are design interpretations of official material, rather than claims about the engines or internal implementation of those games.

- [Monster Prom — Beautiful Glitch](https://beautifulglitch.pizza/monster-prom/), especially its screenshot gallery: large character silhouettes, graphic framing, strong contrast, playful asymmetry, and a distinct space for decisions. This is the primary reference. Use bold ink outlines, paper dialogue, offset shadows, colored speaker labels and compact choice cards, adapted to the bakery's warmer palette. Do not import its characters or artwork.
- [Boyfriend Dungeon — Kitfox](https://kitfoxgames.itch.io/boyfriend-dungeon) and the user's supplied dialogue screenshot: portraits belong to the scene, with a clear named speaker and choices above the dialogue. Keep faces clear of the text panel, and show Rowan during his internal narration and responses.
- [Robin Morningwood — Grizzly Gamer Studio](https://grizzlygamerstudio.wixsite.com/website/robin-morningwood-adventure): its village repair, equipment, tasks and relationships reinforce a home-and-outing structure. Keep the bakery an interactive hub and tools as contextual overlays. The reference is its RPG structure, not its explicit content.
- [Scarlet Hollow — Black Tabby Games press kit](https://blacktabbygames.com/press-sh): emphasis on authored character interactions and meaningful choices. Keep story readability and input control ahead of animation spectacle; retain friendship and explicit romance as separate decisions.

## Implemented

- Original Rowan thinking sprite; the conversation partner remains in the background during his response.
- Short backdrop crossfades and character entrances, scene feedback, menu entrances and responsive button feedback.
- Scene mutations remain synchronous. Animations never delay saved progress, payment or the next action.
- Rebuilt dialogue treatment: cream paper, coral/mint nameplates, ink choice cards, clear response hierarchy and touch-sized controls.
- Progressive text, click-to-reveal, Enter/Space reveal before continue, persisted instant-text preference and a 50-entry conversation log for the current dialogue session. Selecting a choice remains immediate.
- Text reserves its full final height while revealing. Reduced-motion preference disables progressive text and motion.
- Overlay focus trapping is retained, and story shortcuts cannot fire through the log or other overlays.
- NPC hotspot priority corrected where Lucien overlaps the bed.

## Scope and follow-up

React is suitable for this layered 2D presentation. A game-engine migration would not supply missing scene direction, writing, expressions or finished artwork. Current illustrations remain prototype SVGs; a future art pass should add a consistent expression/pose set and richer environments. Audio is still absent. The conversation log is session-local, not a persistent transcript, and is not a rollback feature.

## Validation

Run `npm test`, `npm run build`, and `npm run test:browser`. The browser suite exercises progression, saves, romance/endings, room controls, keyboard/focus, puzzles, mouse/touch cooking and mobile layouts. The presentation-specific check covers text reveal, preference persistence, Rowan/partner staging, log focus and shortcut isolation, and viewport bounds.
