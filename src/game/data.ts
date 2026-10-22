import type { Condition } from "./conditions";
export type Npc = "orin" | "lucien";
export const characters = {
  orin: {
    name: "Orin",
    role: "THE GENTLE GARGOYLE",
    color: "#8eaaa1",
    icon: "♜",
    intro:
      "“I brought you a flower. It was growing on my shoulder.” Orin blushes, scattering a little moss.",
    memory: "You found my bell. For the first time in a century, I feel heard.",
  },
  lucien: {
    name: "Lucien",
    role: "THE NIGHT LIBRARIAN",
    color: "#ae8fb9",
    icon: "☾",
    intro:
      "“A handsome baker and a book with a happy ending. My evening is looking up.”",
    memory:
      "You remembered how I take my tea. Some stories are worth leaving the library for.",
  },
};
export const recipes = [
  {
    id: "moon",
    name: "Moonberry Crescent",
    base: "Crescent",
    filling: "Moonberry",
    topping: "Star sugar",
    color: "#b29ad8",
    description: "A buttery crescent with moonberry jam and a little stardust.",
    customer: "Pip",
    quote: "Something sweet for my graveyard shift? Extra stars, please.",
  },
  {
    id: "ember",
    name: "Emberheart Bun",
    base: "Bun",
    filling: "Ember apple",
    topping: "Cinnamon",
    color: "#e9a27a",
    description:
      "Warm apple, soft dough, and a brave little pinch of cinnamon.",
    customer: "Mallow",
    quote: "One emberheart bun. Warm enough to thaw a ghost, ideally.",
  },
  {
    id: "ghost",
    name: "Ghostlight Tart",
    base: "Tart",
    filling: "Vanilla cloud",
    topping: "Pearls",
    color: "#b9d5bf",
    description: "A crisp shell holding a cloud of vanilla and sugar pearls.",
    customer: "Vesper",
    quote: "A ghostlight tart for my very much alive grandmother.",
  },
];
export const upgrades = [
  {
    name: "Enchanted mixing bowl",
    cost: 35,
    description: "+2 coins on every order. A spoon that stirs itself.",
  },
  {
    name: "Hearth of little wonders",
    cost: 55,
    description: "+4 total coins per order. Your oven learns a warmer song.",
  },
  {
    name: "Moonlit display case",
    cost: 75,
    description: "+6 total coins per order. The village starts talking.",
  },
  {
    name: "The wishing hearth",
    cost: 95,
    description:
      "+8 total coins per order. A finished bakery. A new beginning.",
  },
];
export const quests = [
  {
    id: "bell",
    name: "For whom the bell scones",
    rumor: "Orin’s bell has gone quiet.",
    location: "Bell Tower",
    puzzle: "bells",
    objective: "Visit the Bell Tower and put its three bells in order.",
    reward: "20 coins · Orin’s heart event unlocked",
    requires: [] as Condition[],
  },
  {
    id: "lantern",
    name: "A light in the stacks",
    rumor: "Someone has been borrowing the moonlight.",
    location: "Moonlit Library",
    puzzle: "sequence",
    objective: "Solve the library’s lantern sequence.",
    reward: "20 coins · a story to tell",
    requires: [] as Condition[],
  },
];
export const locations = [
  {
    name: "Bell Tower",
    icon: "♜",
    description: "A sleepy tower with a missing melody.",
    objects: ["Mossy gargoyle", "Old bell rope"],
    puzzle: "bells",
  },
  {
    name: "Moonlit Library",
    icon: "☾",
    description: "Books that whisper. Tea that listens.",
    objects: ["Whispering shelf", "Silver teacup"],
    puzzle: "sequence",
  },
  {
    name: "Mushroom Square",
    icon: "♧",
    description: "A small market under very large mushrooms.",
    objects: ["Wishing fountain", "Crooked signpost"],
    puzzle: "deduction",
  },
];
export const puzzles = {
  bells: {
    title: "The silent chime",
    type: "arrangement",
    intro: "Three bells need their voices back. Orin has left a note.",
    description:
      "Place the bells from left to right. The silver bell is somewhere to the right of the bronze bell. The gold bell is not at either end.",
    hints: [
      "Which bell cannot be at either end?",
      "Gold must be in the middle. Bronze is to the left of silver.",
      "Place Bronze, Gold, then Silver.",
    ],
    answer: "Bronze,Gold,Silver",
  },
  sequence: {
    title: "Borrowed moonlight",
    type: "number",
    intro: "A librarian has enchanted the lanterns with a growing rhythm.",
    description:
      "The lanterns glow in this order: 2, 6, 12, 20, 30, … How many sparks should the next lantern hold?",
    hints: [
      "Look at the difference between neighboring numbers.",
      "The differences are 4, 6, 8, 10.",
      "The next difference is 12. Add it to 30.",
    ],
    answer: "42",
  },
  deduction: {
    title: "The midnight delivery",
    type: "deduction",
    intro: "Three neighbors ordered pastries. The labels have floated away.",
    description:
      "Ada, Bram, and Cora each ordered a different pastry: a bun, tart, or crescent. Ada ordered neither the bun nor the tart. Bram did not order the bun. Who ordered the bun?",
    hints: [
      "Start with Ada. Two pastries are ruled out.",
      "Ada has the crescent. Bram must have the tart.",
      "The only pastry left for Cora is the bun.",
    ],
    answer: "Cora",
  },
};
export type PuzzleId = keyof typeof puzzles;
