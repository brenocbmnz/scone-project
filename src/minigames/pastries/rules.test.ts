import { describe, it, expect } from "vitest";
import { initial, bake, parseSave } from "../../game/rules";
import { freshBaking } from "../baking/session";
import {
  advanceRhythm,
  answerRecipe,
  beatAt,
  correctTiles,
  freshPastry,
  knead,
  memoryPattern,
  nextPastry,
  orderFor,
  pastryScore,
  pipeIcing,
  pipeSection,
  placeTile,
  readPastrySession,
  spiral,
  targetTurns,
  unlockLevel,
  type PastrySession,
} from "./rules";
describe("menu and sampler progression", () => {
  it.each([1, 2, 3, 4, 5])(
    "only offers unlocked pastries at level %s",
    (level) => {
      for (let day = 1; day <= 12; day++)
        for (let orders = 0; orders < 2; orders++)
          for (const id of orderFor({ day, orders, level, baking: null }))
            expect(unlockLevel(id)).toBeLessThanOrEqual(level);
    },
  );
  it("adds occasional two-type samplers only at level five", () => {
    expect(orderFor({ day: 3, orders: 0, level: 5, baking: null })).toEqual([
      "ember",
      "moon",
    ]);
    expect(
      orderFor({ day: 3, orders: 0, level: 4, baking: null }),
    ).toHaveLength(1);
    expect(
      orderFor({ day: 4, orders: 0, level: 5, baking: null }),
    ).toHaveLength(1);
  });
  it("pays a sampler as one customer and counts both pastries", () => {
    const base = { ...initial(), level: 5, started: true, workStarted: true };
    const paid = bake(base, 6, 2);
    expect(paid.money - base.money).toBe(64);
    expect(paid.orders).toBe(1);
    expect(paid.totalOrders).toBe(2);
    expect(paid.phase).toBe("work");
    const final = bake({ ...paid, workStarted: true }, 6, 2);
    expect(final.orders).toBe(2);
    expect(final.phase).toBe("free");
    expect(final.baking).toBeNull();
    expect(bake(base, 7, 2)).toBe(base);
    expect(bake(base, 3, 3)).toBe(base);
  });
});
describe("four signature games", () => {
  it("judges each rhythm beat once, allows generous timing, and records misses", () => {
    let s = { ...freshPastry(["ember"]), stage: "play" } as PastrySession;
    expect(knead(s)).toBe(s);
    for (let i = 0; i < 6; i++) {
      s = advanceRhythm(s, beatAt(i));
      s = knead(s);
      if (i < 5) expect(knead(s)).toBe(s);
    }
    expect(s.beats).toEqual([2, 2, 2, 2, 2, 2]);
    expect(s.stage).toBe("result");
    expect(pastryScore(s)).toBe(3);
    const missed = advanceRhythm(
      { ...freshPastry(["ember"]), stage: "play" },
      7500,
    );
    expect(missed.stage).toBe("result");
    expect(pastryScore(missed)).toBe(0);
    const assisted = {
      ...freshPastry(["ember"]),
      stage: "play",
      assisted: true,
      elapsed: beatAt(0) - 330,
    } as PastrySession;
    expect(knead(assisted).beats).toEqual([1]);
  });
  it("requires both correct slot and rotation and swaps occupied pieces", () => {
    let s = { ...freshPastry(["moon"]), stage: "play" } as PastrySession;
    s = placeTile(s, 0, 1);
    s = placeTile(s, 1, 1);
    expect(s.tiles).toEqual([-1, 1, -1]);
    s = { ...s, turns: [...targetTurns] };
    for (let i = 0; i < 3; i++) s = placeTile(s, i, i);
    expect(correctTiles(s)).toBe(3);
    expect(pastryScore(s)).toBe(3);
    expect(correctTiles({ ...s, turns: [0, 0, 1] })).toBe(2);
  });
  it("keeps memory patterns stable, counts mix-ups, and preserves good answers", () => {
    const pattern = memoryPattern(17);
    expect(new Set(pattern).size).toBe(4);
    expect(memoryPattern(17)).toEqual(pattern);
    let s = { ...freshPastry(["ghost"], 17), stage: "play" } as PastrySession;
    s = answerRecipe(s, (pattern[0] + 1) % 4);
    expect(s.answers).toEqual([]);
    expect(s.mistakes).toBe(1);
    for (const bowl of pattern) s = answerRecipe(s, bowl);
    expect(s.stage).toBe("result");
    expect(pastryScore(s)).toBe(3);
    expect(pastryScore({ ...s, mistakes: 4 })).toBe(1);
  });
  it("rejects jumping to the spiral center, supports lifting, and gives equivalent keyboard scores", () => {
    let s = { ...freshPastry(["cinnamon"]), stage: "play" } as PastrySession;
    expect(pipeIcing(s, spiral[79])).toBe(s);
    for (const p of spiral) s = pipeIcing(s, p);
    expect(s.traced).toBe(80);
    expect(pastryScore(s)).toBe(3);
    let keyboard = {
      ...freshPastry(["cinnamon"]),
      stage: "play",
    } as PastrySession;
    for (let i = 0; i < 10; i++) keyboard = pipeSection(keyboard);
    expect(pastryScore(keyboard)).toBe(pastryScore(s));
    expect(readPastrySession(s)).toEqual(s);
  });
  it("packs a result once without skipping the next customer or losing the first score", () => {
    const s = {
      ...freshPastry(["ember", "moon"]),
      stage: "result",
      beats: [2, 2, 2, 2, 2, 2],
    } as PastrySession;
    const next = nextPastry(s);
    expect(next.part).toBe(1);
    expect(next.scores).toEqual([3]);
    expect(next.stage).toBe("intro");
    expect(nextPastry(next)).toBe(next);
    expect(readPastrySession(next)).toEqual(next);
    expect(orderFor({ ...initial(), baking: next })).toEqual(["ember", "moon"]);
  });
});
describe("save migration and validation", () => {
  it("preserves old unpaid scores and safely restarts old unfinished recipes", () => {
    const old = {
      ...freshBaking("moon"),
      stage: "result",
      shaped: 3,
      heat: 70,
      bakeRating: 2,
      marks: [
        { x: 255, y: 245 },
        { x: 320, y: 300 },
        { x: 410, y: 320 },
      ],
    };
    const migrated = readPastrySession(old)!;
    expect(migrated.stage).toBe("result");
    expect(pastryScore(migrated)).toBe(3);
    expect(readPastrySession(freshBaking("moon"))?.stage).toBe("intro");
    expect(
      parseSave(JSON.stringify({ ...initial(), baking: old }))?.baking
        ?.legacyScore,
    ).toBe(3);
  });
  it.each([
    { part: 2 },
    { scores: [4] },
    { tiles: [0, 0, 0] },
    { turns: [9, 0, 0] },
    { elapsed: Infinity },
    { marks: [{ x: NaN, y: 4 }] },
    { beats: [8] },
    { orderIds: ["unknown"] },
    { answers: [8] },
    { stage: "result" },
  ])("rejects malformed drafts %j", (patch) =>
    expect(
      readPastrySession({ ...freshPastry(["ember"]), ...patch }),
    ).toBeNull(),
  );
});
