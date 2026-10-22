import type { Npc } from "./data";
import type { Progress } from "./rules";
export type SceneId = "bakery" | "village" | "tower" | "library" | "square";
export interface StoryBeat {
  speaker: string;
  text: string;
}
export const introduction: StoryBeat[] = [
  {
    speaker: "Rowan",
    text: "A new village. A second-hand apron. An oven that may or may not be haunted. Well, then. This is home.",
  },
  {
    speaker: "Narrator",
    text: "You left the human world looking for a quieter life. Bramblewick offered affordable rent, excellent moonlight, and a suspiciously handsome gargoyle.",
  },
  {
    speaker: "Narrator",
    text: "Two customers each morning. One little adventure in the afternoon. A quiet evening by your own hearth. There is no clock to race—only a life to make.",
  },
];
export const sceneNames: Record<SceneId, string> = {
  bakery: "The Crumb & Cauldron",
  village: "Bramblewick",
  tower: "The Bell Tower",
  library: "Moonlit Library",
  square: "Mushroom Square",
};
export const locationScenes: SceneId[] = ["tower", "library", "square"];
export const locationNarration = [
  "Ivy curls around the tower’s old stones. Three silent bells hang above you. A note in Orin’s careful handwriting is tucked beneath the bell rope.",
  "The library smells of paper, bergamot, and yesterday’s rain. Over the reading desk, a row of lanterns blinks in a most deliberate rhythm.",
  "Under the shelter of enormous mushrooms, the market is winding down. Three neighbors are arguing affectionately about a delivery of unlabeled pastries.",
];
export function homeNarration(s: Progress): StoryBeat {
  if (s.phase === "work")
    return {
      speaker: "Narrator",
      text:
        s.orders === 0
          ? "Morning spills through the bakery window. The hearth is humming its favorite tune, and someone is already waiting at the counter. You straighten your apron. Time to make a little magic."
          : "The doorbell gives another cheerful shiver. One more order before the afternoon is yours. The oven is still warm.",
    };
  if (s.phase === "free")
    return {
      speaker: "Rowan",
      text: "The last customer leaves with a warm paper bag and an even warmer smile. I turn the sign to CLOSED. There’s a whole village outside—and just enough afternoon for one little adventure.",
    };
  return {
    speaker: "Narrator",
    text: s.scheduled
      ? "A promise waits for tomorrow. For now, the hearth is warm, the dishes are done, and your bed is calling. Nothing more is asked of you tonight."
      : "The village settles into its evening hush. You set the kettle on and brush the last flour from your sleeves. This little bakery is beginning to feel like yours.",
  };
}

export interface SceneProgress {
  screen: "home" | "village";
  visit: number | null;
  talk: Npc | null;
  beat: number;
  intro: number | null;
}
export const initialScene = (): SceneProgress => ({
  screen: "home",
  visit: null,
  talk: null,
  beat: 0,
  intro: null,
});
