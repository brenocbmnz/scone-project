import { describe, expect, it } from "vitest";
import {
  bakeRating,
  cookingScore,
  coverage,
  finishZones,
  freshBaking,
  gestureProgress,
  readBakingSession,
  shapeGesture,
  type BakingSession,
} from "./session";
import { freshSession } from "../stacking/physics";
import { parseSave, initial } from "../../game/rules";
describe("tactile baking rules", () => {
  it.each([
    [0, 0],
    [39, 0],
    [40, 1],
    [57, 1],
    [58, 2],
    [82, 2],
    [83, 1],
    [96, 1],
    [97, 0],
    [100, 0],
  ])("rates a one-way bake at %s as %s", (heat, rating) =>
    expect(bakeRating(heat)).toBe(rating),
  );
  it.each(["moon", "ember", "ghost", "cinnamon"])(
    "has three achievable gestures for %s",
    (id) => {
      for (let step = 0; step < 3; step++) {
        const g = shapeGesture(id, step);
        expect(gestureProgress(g, g.from)).toBe(0);
        expect(gestureProgress(g, g.to)).toBe(1);
        expect(
          gestureProgress(g, {
            x: g.to.x + (g.to.y - g.from.y) * 5,
            y: g.to.y - (g.to.x - g.from.x) * 5,
          }),
        ).toBe(0);
      }
    },
  );
  it("scores broad topping coverage, never repeated sprinkles in one section", () => {
    const base = {
      ...freshBaking("moon"),
      shaped: 3,
      heat: 70,
      bakeRating: 2,
      stage: "finish",
    } as BakingSession;
    expect(cookingScore(base)).toBe(2);
    const one = { ...base, marks: Array(20).fill(finishZones("moon")[0]) };
    expect(coverage(one)).toBe(1);
    expect(cookingScore(one)).toBe(2);
    expect(
      cookingScore({ ...base, marks: finishZones("moon").slice(0, 3) }),
    ).toBe(3);
  });
  it.each(["moon", "ember", "ghost", "cinnamon"])(
    "round-trips finished %s and rejects inconsistent or malformed drafts",
    (recipeId) => {
      const good = {
        ...freshBaking(recipeId),
        shaped: 3,
        heat: 70,
        bakeRating: 2,
        stage: "result",
        marks: finishZones(recipeId).slice(0, 3),
      } as BakingSession;
      expect(readBakingSession(JSON.parse(JSON.stringify(good)))).toEqual(good);
      expect(readBakingSession({ ...good, heat: Infinity })).toBeNull();
      expect(readBakingSession({ ...good, shaped: 1 })).toBeNull();
      expect(readBakingSession({ ...good, bakeRating: 0 })).toBeNull();
      expect(
        readBakingSession({ ...good, marks: [{ x: 999, y: 0 }] }),
      ).toBeNull();
      expect(
        readBakingSession({ ...good, marks: Array(161).fill(good.marks[0]) }),
      ).toBeNull();
      expect(readBakingSession({ ...good, legacyScore: 99 })).toBeNull();
    },
  );
  it("migrates unfinished legacy stacks to a fresh recipe and preserves unpaid results", () => {
    const old = freshSession("moon");
    expect(readBakingSession(old)).toEqual(freshBaking("moon"));
    const migrated = readBakingSession({ ...old, served: true })!;
    expect(migrated.stage).toBe("result");
    expect(cookingScore(migrated)).toBe(0);
    const state = parseSave(
      JSON.stringify({ ...initial(), baking: { ...old, served: true } }),
    )!;
    expect(state.money).toBe(25);
    expect(state.orders).toBe(0);
    expect(state.baking?.legacyScore).toBe(0);
    expect(readBakingSession(migrated)).toEqual(migrated);
  });
  it("rejects unknown recipe ids and safely drops only malformed cooking data", () => {
    expect(
      readBakingSession({ ...freshBaking("moon"), recipeId: "missing" }),
    ).toBeNull();
    const state = parseSave(
      JSON.stringify({
        ...initial(),
        money: 145,
        baking: { kind: "tactile-v1" },
      }),
    )!;
    expect(state.money).toBe(145);
    expect(state.baking).toBeNull();
  });
});
