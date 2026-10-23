import { recipes } from "../../game/data";
import { readBakingSession, cookingScore } from "../baking/session";
export type RecipeId = "ember" | "moon" | "ghost" | "cinnamon";
export const menu: RecipeId[] = ["ember", "moon", "ghost", "cinnamon"];
export const unlockLevel = (id: string) => menu.indexOf(id as RecipeId) + 1;
export const gameNames: Record<RecipeId, string> = {
  ember: "Hearthbeat kneading",
  moon: "Crescent dough puzzle",
  ghost: "The whispering recipe",
  cinnamon: "Spiral icing",
};
export interface Point {
  x: number;
  y: number;
}
export interface PastrySession {
  kind: "pastry-v1";
  orderIds: RecipeId[];
  part: number;
  scores: number[];
  seed: number;
  stage: "intro" | "play" | "result";
  assisted: boolean;
  elapsed: number;
  beats: number[];
  tiles: number[];
  turns: number[];
  answers: number[];
  mistakes: number;
  marks: Point[];
  traced: number;
  legacyScore?: number;
}
export const freshPastry = (orderIds: RecipeId[], seed = 0): PastrySession => ({
  kind: "pastry-v1",
  orderIds: [...orderIds],
  part: 0,
  scores: [],
  seed,
  stage: "intro",
  assisted: false,
  elapsed: 0,
  beats: [],
  tiles: [-1, -1, -1],
  turns: [1, 2, 3],
  answers: [],
  mistakes: 0,
  marks: [],
  traced: 0,
});
export function orderFor(g: {
  day: number;
  orders: number;
  level: number;
  baking: PastrySession | null;
}): RecipeId[] {
  if (g.baking) return g.baking.orderIds;
  const available = menu.slice(0, Math.min(4, Math.max(1, g.level)));
  const index = ((g.day - 1) * 2 + g.orders) % available.length;
  const first = available[index];
  return g.level === 5 && (g.day + g.orders) % 3 === 0
    ? [first, available[(index + 1) % available.length]]
    : [first];
}
export const beatAt = (i: number) => 1400 + i * 1050;
export const rhythmWindow = (assisted: boolean) => (assisted ? 360 : 240);
export function advanceRhythm(
  s: PastrySession,
  elapsed: number,
): PastrySession {
  const beats = [...s.beats];
  while (
    beats.length < 6 &&
    elapsed > beatAt(beats.length) + rhythmWindow(s.assisted)
  )
    beats.push(0);
  return {
    ...s,
    elapsed: Math.min(7600, elapsed),
    beats,
    ...(beats.length === 6 ? { stage: "result" as const } : {}),
  };
}
export function knead(s: PastrySession): PastrySession {
  if (
    s.stage !== "play" ||
    s.orderIds[s.part] !== "ember" ||
    s.beats.length >= 6
  )
    return s;
  const delta = Math.abs(s.elapsed - beatAt(s.beats.length));
  if (delta > rhythmWindow(s.assisted)) return s;
  const beats = [...s.beats, delta <= 110 ? 2 : 1];
  return {
    ...s,
    beats,
    ...(beats.length === 6 ? { stage: "result" as const } : {}),
  };
}
export const targetTurns = [3, 0, 1];
export const correctTiles = (s: PastrySession) =>
  s.tiles.filter((slot, i) => slot === i && s.turns[i] === targetTurns[i])
    .length;
export function placeTile(
  s: PastrySession,
  piece: number,
  slot: number,
): PastrySession {
  const tiles = [...s.tiles];
  const other = tiles.indexOf(slot);
  const old = tiles[piece];
  if (other !== -1 && other !== piece) tiles[other] = old;
  tiles[piece] = slot;
  return { ...s, tiles };
}
export function memoryPattern(seed: number): number[] {
  const pattern = [0, 1, 2, 3];
  let n = (seed + 1) >>> 0;
  for (let i = 3; i > 0; i--) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    const j = n % (i + 1);
    [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
  }
  return pattern;
}
export function answerRecipe(s: PastrySession, bowl: number): PastrySession {
  if (s.stage !== "play" || s.answers.length === 4) return s;
  const pattern = memoryPattern(s.seed + s.part);
  if (pattern[s.answers.length] !== bowl)
    return { ...s, mistakes: Math.min(999, s.mistakes + 1) };
  const answers = [...s.answers, bowl];
  return {
    ...s,
    answers,
    ...(answers.length === 4 ? { stage: "result" as const } : {}),
  };
}
export const spiral: Point[] = Array.from({ length: 80 }, (_, i) => {
  const t = i / 79;
  const angle = -Math.PI / 2 + t * Math.PI * 4.5;
  const r = 155 * (1 - t) + 14;
  return {
    x: Math.round(400 + Math.cos(angle) * r),
    y: Math.round(235 + Math.sin(angle) * r * 0.72),
  };
});
export function pipeIcing(s: PastrySession, p: Point): PastrySession {
  if (
    s.stage !== "play" ||
    s.traced >= 80 ||
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y)
  )
    return s;
  let best = -1,
    distance = Infinity;
  for (let i = Math.max(0, s.traced - 2); i < Math.min(80, s.traced + 4); i++) {
    const d = Math.hypot(p.x - spiral[i].x, p.y - spiral[i].y);
    if (d < distance) {
      distance = d;
      best = i;
    }
  }
  if (distance > (s.assisted ? 54 : 30) || best < s.traced) return s;
  return { ...s, traced: best + 1, marks: [...s.marks, p].slice(-320) };
}
export function pipeSection(s: PastrySession): PastrySession {
  const end = Math.min(80, s.traced + 8);
  return {
    ...s,
    traced: end,
    marks: [...s.marks, ...spiral.slice(s.traced, end)].slice(-320),
  };
}
export function pastryScore(s: PastrySession): number {
  if (s.legacyScore !== undefined) return s.legacyScore;
  const id = s.orderIds[s.part];
  if (id === "ember") {
    const hits = s.beats.filter((x) => x > 0).length;
    return hits >= 5 ? 3 : hits >= 3 ? 2 : hits >= 1 ? 1 : 0;
  }
  if (id === "moon") return correctTiles(s);
  if (id === "ghost")
    return s.answers.length < 4
      ? 0
      : s.mistakes <= 1
        ? 3
        : s.mistakes <= 3
          ? 2
          : 1;
  return s.traced >= 64 ? 3 : s.traced >= 40 ? 2 : s.traced >= 16 ? 1 : 0;
}
export function nextPastry(s: PastrySession): PastrySession {
  if (s.stage !== "result" || s.part >= s.orderIds.length - 1) return s;
  return {
    ...freshPastry(s.orderIds, s.seed),
    part: s.part + 1,
    scores: [...s.scores, pastryScore(s)],
    assisted: s.assisted,
  };
}
export function readPastrySession(value: unknown): PastrySession | null {
  if (!value || typeof value !== "object") return null;
  const s = value as PastrySession;
  if (s.kind !== "pastry-v1") {
    const old = readBakingSession(value);
    if (!old) return null;
    const next = freshPastry([old.recipeId as RecipeId]);
    return old.stage === "result"
      ? { ...next, stage: "result", legacyScore: cookingScore(old) }
      : next;
  }
  const int = (n: unknown, min: number, max: number) =>
    typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
  if (
    !Array.isArray(s.orderIds) ||
    s.orderIds.length < 1 ||
    s.orderIds.length > 2 ||
    !s.orderIds.every((id) => menu.includes(id)) ||
    new Set(s.orderIds).size !== s.orderIds.length ||
    !int(s.part, 0, s.orderIds.length - 1) ||
    !Array.isArray(s.scores) ||
    s.scores.length !== s.part ||
    !s.scores.every((n) => int(n, 0, 3)) ||
    !int(s.seed, 0, 1e8) ||
    !["intro", "play", "result"].includes(s.stage) ||
    typeof s.assisted !== "boolean" ||
    !Number.isFinite(s.elapsed) ||
    s.elapsed < 0 ||
    s.elapsed > 7600 ||
    !Array.isArray(s.beats) ||
    s.beats.length > 6 ||
    !s.beats.every((n) => int(n, 0, 2)) ||
    !Array.isArray(s.tiles) ||
    s.tiles.length !== 3 ||
    !s.tiles.every((n) => int(n, -1, 2)) ||
    new Set(s.tiles.filter((n) => n !== -1)).size !==
      s.tiles.filter((n) => n !== -1).length ||
    !Array.isArray(s.turns) ||
    s.turns.length !== 3 ||
    !s.turns.every((n) => int(n, 0, 3)) ||
    !Array.isArray(s.answers) ||
    s.answers.length > 4 ||
    !s.answers.every((n, i) => n === memoryPattern(s.seed + s.part)[i]) ||
    !int(s.mistakes, 0, 999) ||
    !int(s.traced, 0, 80) ||
    !Array.isArray(s.marks) ||
    s.marks.length > 320 ||
    !s.marks.every(
      (p) =>
        p &&
        Number.isFinite(p.x) &&
        p.x >= 0 &&
        p.x <= 800 &&
        Number.isFinite(p.y) &&
        p.y >= 0 &&
        p.y <= 460,
    ) ||
    (s.legacyScore !== undefined &&
      (!int(s.legacyScore, 0, 3) || s.stage !== "result"))
  )
    return null;
  if (
    s.stage === "result" &&
    s.legacyScore === undefined &&
    ((s.orderIds[s.part] === "ember" && s.beats.length !== 6) ||
      (s.orderIds[s.part] === "ghost" && s.answers.length !== 4))
  )
    return null;
  return {
    kind: "pastry-v1",
    orderIds: [...s.orderIds],
    part: s.part,
    scores: [...s.scores],
    seed: s.seed,
    stage: s.stage,
    assisted: s.assisted,
    elapsed: s.elapsed,
    beats: [...s.beats],
    tiles: [...s.tiles],
    turns: [...s.turns],
    answers: [...s.answers],
    mistakes: s.mistakes,
    marks: s.marks.map((p) => ({ x: p.x, y: p.y })),
    traced: s.traced,
    ...(s.legacyScore === undefined ? {} : { legacyScore: s.legacyScore }),
  };
}
export const recipeFor = (id: RecipeId) => recipes.find((r) => r.id === id)!;
