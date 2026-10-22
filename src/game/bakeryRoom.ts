import type { Progress } from "./rules";
export type RoomObject =
  | "register"
  | "oven"
  | "workbench"
  | "recipes"
  | "door"
  | "bed"
  | "orin"
  | "lucien";
export const roomObjects: Record<
  RoomObject,
  { name: string; x: number; y: number; description: string }
> = {
  register: {
    name: "Cash register",
    x: 48,
    y: 58,
    description:
      "The till gives a hopeful little ding. This is where an ordinary morning becomes a work day.",
  },
  oven: {
    name: "Enchanted oven",
    x: 70,
    y: 44,
    description:
      "A friendly flame leans toward you. Better equipment makes every batch a little more rewarding.",
  },
  workbench: {
    name: "Mixing table",
    x: 58,
    y: 67,
    description:
      "Flour, bowls, and a spoon that insists on stirring counterclockwise. Everything is ready for your next order.",
  },
  recipes: {
    name: "Recipe shelf",
    x: 37,
    y: 37,
    description:
      "Your handwritten recipes. A little dog-eared, a little flour-dusted, and entirely yours.",
  },
  door: {
    name: "Front door",
    x: 23,
    y: 43,
    description:
      "Bramblewick waits on the other side. There is time for one afternoon adventure.",
  },
  bed: {
    name: "Cozy bed",
    x: 88,
    y: 68,
    description:
      "A soft blanket in your little sleeping nook. Tomorrow can wait until you are ready.",
  },
  orin: {
    name: "Orin",
    x: 11,
    y: 66,
    description:
      "A familiar gargoyle waits by the window, pretending the flowers are not for you.",
  },
  lucien: {
    name: "Lucien",
    x: 80,
    y: 70,
    description:
      "A librarian has found an excellent excuse to bring a book back to the bakery.",
  },
};
export function startWork(s: Progress): Progress {
  if (s.phase !== "work" || s.orders >= 2) return s;
  return { ...s, workStarted: true, scene: { ...s.scene, room: false } };
}
export const canLeaveBakery = (s: Progress) => s.phase === "free";
export const canSleep = (s: Progress) => s.phase === "evening";

// Coordinates use the room illustration's viewBox, so click areas scale with the art.
export const roomRegions: Record<
  RoomObject,
  { left: number; top: number; width: number; height: number }
> = {
  register: { left: 44, top: 46, width: 9, height: 15 },
  oven: { left: 60, top: 29, width: 13, height: 34 },
  workbench: { left: 53, top: 50, width: 6, height: 21 },
  recipes: { left: 30, top: 25, width: 27, height: 20 },
  door: { left: 19, top: 22, width: 8, height: 49 },
  bed: { left: 77, top: 55, width: 20, height: 24 },
  orin: { left: 8, top: 61, width: 6, height: 10 },
  lucien: { left: 77, top: 65, width: 6, height: 10 },
};
