import { initialScene, type SceneProgress } from "./scenes";
import { type Npc, upgrades, puzzles, quests } from "./data";
export type Phase = "work" | "free" | "evening" | "ending";
export interface Progress {
  version: 1;
  scene: SceneProgress;
  started: boolean;
  day: number;
  phase: Phase;
  money: number;
  coins: number;
  level: number;
  orders: number;
  affection: Record<Npc, number>;
  romance: Record<Npc, boolean>;
  final: Record<Npc, boolean>;
  flags: string[];
  solved: string[];
  hints: Record<string, number>;
  collected: string[];
  scheduled: Npc | null;
  ending: Npc | null;
  totalOrders: number;
}
export const initial = (): Progress => ({
  version: 1,
  scene: initialScene(),
  started: false,
  day: 1,
  phase: "work",
  money: 25,
  coins: 3,
  level: 1,
  orders: 0,
  affection: { orin: 0, lucien: 0 },
  romance: { orin: false, lucien: false },
  final: { orin: false, lucien: false },
  flags: [],
  solved: [],
  hints: {},
  collected: [],
  scheduled: null,
  ending: null,
  totalOrders: 0,
});
export const relationshipLevel = (s: Progress, n: Npc) =>
  Math.min(
    n === "orin" && !s.flags.includes("bell") ? 3 : 5,
    1 + Math.floor(s.affection[n] / 2),
  );
export const eligible = (s: Progress, n: Npc) =>
  s.level === 5 && relationshipLevel(s, n) === 5 && s.final[n] && s.romance[n];
export function upgrade(s: Progress): Progress {
  const u = upgrades[s.level - 1];
  return !u || s.phase !== "evening" || s.money < u.cost
    ? s
    : { ...s, money: s.money - u.cost, level: s.level + 1 };
}
export function hint(s: Progress, id: string): Progress {
  const count = s.hints[id] ?? 0;
  return !(id in puzzles) || s.solved.includes(id) || s.coins < 1 || count >= 3
    ? s
    : { ...s, coins: s.coins - 1, hints: { ...s.hints, [id]: count + 1 } };
}
export function solve(s: Progress, id: string): Progress {
  if (!(id in puzzles) || s.solved.includes(id)) return s;
  const flag = quests.find((q) => q.puzzle === id)?.id;
  return {
    ...s,
    solved: [...s.solved, id],
    coins: s.coins + 2,
    money: s.money + 20,
    flags: flag && !s.flags.includes(flag) ? [...s.flags, flag] : s.flags,
  };
}
export function bake(s: Progress, score: number): Progress {
  if (s.phase !== "work" || s.orders >= 2) return s;
  return {
    ...s,
    money: s.money + 12 + score * 4 + (s.level - 1) * 2,
    orders: s.orders + 1,
    totalOrders: s.totalOrders + 1,
    phase: s.orders === 1 ? "free" : "work",
  };
}
export function spendTime(s: Progress, n: Npc, romantic: boolean): Progress {
  if (s.phase !== "free") return s;
  const next = {
    ...s,
    phase: "evening" as Phase,
    affection: { ...s.affection, [n]: s.affection[n] + 2 },
    romance: { ...s.romance, [n]: romantic || s.romance[n] },
  };
  return {
    ...next,
    final: {
      ...next.final,
      [n]:
        next.final[n] || (relationshipLevel(next, n) === 5 && next.romance[n]),
    },
  };
}
export function sleep(s: Progress): Progress {
  return s.phase !== "evening"
    ? s
    : {
        ...s,
        day: s.day + 1,
        scene: initialScene(),
        orders: 0,
        phase: s.scheduled ? "ending" : "work",
      };
}
export function parseSave(raw: string | null): Progress | null {
  try {
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const v = value as Record<string, unknown>;
    if (
      v.version !== 1 ||
      typeof v.day !== "number" ||
      !Number.isInteger(v.day) ||
      v.day < 1
    )
      return null;
    const base = initial();
    const s = {
      ...base,
      ...v,
      affection: { ...base.affection, ...(v.affection as object) },
      romance: { ...base.romance, ...(v.romance as object) },
      final: { ...base.final, ...(v.final as object) },
    } as Progress;
    const integer = (n: unknown, min: number, max = Number.MAX_SAFE_INTEGER) =>
      typeof n === "number" && Number.isSafeInteger(n) && n >= min && n <= max;
    if (
      !["work", "free", "evening", "ending"].includes(s.phase) ||
      !integer(s.money, 0) ||
      !integer(s.coins, 0) ||
      !integer(s.level, 1, 5) ||
      !integer(s.orders, 0, 2) ||
      !integer(s.totalOrders, 0) ||
      typeof s.started !== "boolean"
    )
      return null;
    if (
      ![s.flags, s.solved, s.collected].every(
        (a) => Array.isArray(a) && a.every((x) => typeof x === "string"),
      )
    )
      return null;
    if (
      !s.hints ||
      typeof s.hints !== "object" ||
      !Object.values(s.hints).every((n) => integer(n, 0, 3))
    )
      return null;
    for (const n of ["orin", "lucien"] as Npc[])
      if (
        !integer(s.affection[n], 0) ||
        typeof s.romance[n] !== "boolean" ||
        typeof s.final[n] !== "boolean"
      )
        return null;
    if (
      ![null, "orin", "lucien"].includes(s.scheduled) ||
      ![null, "orin", "lucien"].includes(s.ending) ||
      (s.phase === "ending" && !s.scheduled)
    )
      return null;
    const scene = { ...initialScene(), ...(v.scene as object) };
    if (
      !["home", "village"].includes(scene.screen) ||
      ![null, 0, 1, 2].includes(scene.visit) ||
      ![null, "orin", "lucien"].includes(scene.talk) ||
      !integer(scene.beat, 0, 1) ||
      ![null, 0, 1, 2].includes(scene.intro)
    )
      return null;
    if (
      (scene.visit !== null && s.phase !== "evening") ||
      (scene.talk !== null && s.phase !== "free")
    )
      return null;
    return { ...s, scene };
  } catch {
    return null;
  }
}

export function scheduleEnding(s: Progress, n: Npc): Progress {
  return s.phase === "evening" && eligible(s, n) ? { ...s, scheduled: n } : s;
}
