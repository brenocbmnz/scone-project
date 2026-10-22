import { describe, it, expect } from "vitest";
import { recipes } from "../../game/data";
import { initial, parseSave } from "../../game/rules";
import { ingredientById, requirementsFor } from "./ingredients";
import {
  freshSession,
  addPiece,
  stepPieces,
  isMoving,
  scoreStack,
  readStackSession,
  onPlate,
  type StackSession,
} from "./physics";
function settle(s: StackSession): StackSession {
  let pieces = s.pieces;
  for (let n = 0; n < 2400 && isMoving(pieces); n++)
    pieces = stepPieces(pieces, 1 / 120);
  expect(isMoving(pieces)).toBe(false);
  return { ...s, pieces };
}
const drop = (s: StackSession, id: string, x = 400) =>
  settle(addPiece(s, id, x));
describe("forgiving pastry stacking", () => {
  it.each(recipes)(
    "supports every requested layer of $name and awards one point each",
    (r) => {
      let s = freshSession(r.id);
      for (const need of requirementsFor(r)) s = drop(s, need.ingredientId);
      const score = scoreStack(s.pieces, requirementsFor(r));
      expect(score.points).toBe(3);
      expect(score.standing).toBe(3);
      expect(score.payoutScore).toBe(3);
      expect(s.pieces[0].support).toBe("plate");
      expect(s.pieces[2].support).toBe(s.pieces[1].id);
    },
  );
  it("does not count a correct ingredient dropped off the plate", () => {
    const r = recipes[0];
    const s = drop(freshSession(r.id), "base:Crescent", 748);
    expect(s.pieces[0].status).toBe("lost");
    expect(scoreStack(s.pieces, requirementsFor(r)).points).toBe(0);
  });
  it("slides an unsupported overhang off the edge instead of suspending it", () => {
    const s = drop(freshSession("moon"), "base:Crescent", 665);
    expect(s.pieces[0].status).toBe("lost");
    expect(s.pieces[0].x).toBeGreaterThan(665);
  });
  it("allows a generous overhang with its center still supported", () => {
    const s = drop(freshSession("moon"), "base:Crescent", 615);
    expect(s.pieces[0].status).toBe("settled");
    expect(onPlate(s.pieces[0], s.pieces)).toBe(true);
  });
  it("counts a fallen upper layer if it lands on the plate itself", () => {
    let s = drop(freshSession("moon"), "base:Bun");
    s = drop(s, "filling:Moonberry", 530);
    expect(s.pieces[1].support).toBe("plate");
    expect(scoreStack(s.pieces, requirementsFor(recipes[0])).points).toBe(1);
  });
  it("caps duplicate ingredients at requested quantities and ignores wrong ingredients", () => {
    let s = drop(freshSession("moon"), "base:Crescent");
    s = drop(s, "base:Crescent");
    s = drop(s, "filling:Ember apple");
    expect(scoreStack(s.pieces, requirementsFor(recipes[0])).points).toBe(1);
  });
  it("supports recipes requesting multiple copies without point farming", () => {
    let s = drop(freshSession("test"), "topping:Star sugar");
    s = drop(s, "topping:Star sugar");
    s = drop(s, "topping:Star sugar");
    expect(
      scoreStack(s.pieces, [{ ingredientId: "topping:Star sugar", count: 2 }])
        .points,
    ).toBe(2);
  });
  it("will not drop another item while one is moving or after serving", () => {
    const s = addPiece(freshSession("moon"), "base:Crescent", 400);
    expect(addPiece(s, "base:Bun", 400)).toBe(s);
    const served = { ...settle(s), served: true };
    expect(addPiece(served, "base:Bun", 400)).toBe(served);
  });
  it("keeps a failed creation payable at the Homemade tier", () => {
    const s = drop(freshSession("moon"), "base:Bun");
    const result = scoreStack(s.pieces, requirementsFor(recipes[0]));
    expect(result).toMatchObject({ points: 0, payoutScore: 0 });
    expect(12 + result.payoutScore * 4).toBe(12);
  });
  it("does not mutate previous state or accelerate for a huge frame delta", () => {
    const s = addPiece(freshSession("moon"), "base:Crescent", 400);
    const before = structuredClone(s);
    stepPieces(s.pieces, 999);
    expect(s).toEqual(before);
    expect(stepPieces(s.pieces, 999)).toEqual(stepPieces(s.pieces, 1 / 30));
  });
  it("does not count an unsupported settled item", () => {
    const s = drop(freshSession("moon"), "base:Crescent");
    expect(onPlate({ ...s.pieces[0], support: 999 }, s.pieces)).toBe(false);
  });
  it("limits the board to twelve items", () => {
    let s = freshSession("test");
    for (let i = 0; i < 12; i++)
      s = drop(s, "topping:Sugar sprinkles", i % 2 ? 350 : 450);
    expect(addPiece(s, "base:Bun", 400)).toBe(s);
  });
});
describe("baking session persistence", () => {
  it("migrates a moving legacy session to tactile preparation", () => {
    const baking = addPiece(
      { ...freshSession("moon"), selected: "base:Crescent" },
      "base:Crescent",
      400,
    );
    expect(parseSave(JSON.stringify({ ...initial(), baking }))?.baking).toEqual(
      {
        kind: "tactile-v1",
        recipeId: "moon",
        stage: "shape",
        shaped: 0,
        heat: 0,
        bakeRating: null,
        marks: [],
        assisted: false,
      },
    );
  });
  it("defaults older saves to an empty session", () => {
    const { baking, ...old } = initial();
    expect(parseSave(JSON.stringify(old))?.baking).toBeNull();
  });
  it("discards a corrupt draft without discarding money and story progress", () => {
    expect(
      parseSave(
        JSON.stringify({
          ...initial(),
          money: 99,
          baking: { recipeId: "moon", pieces: "bad" },
        }),
      ),
    ).toMatchObject({ money: 99, baking: null });
  });
  it("rejects missing ingredients, duplicate IDs, impossible support chains and malformed motion", () => {
    const s = drop(freshSession("moon"), "base:Crescent");
    for (const patch of [
      { ingredientId: "unknown" },
      { support: 1 },
      { support: 999 },
      { vx: Infinity },
      { status: "flying" },
    ])
      expect(
        readStackSession({ ...s, pieces: [{ ...s.pieces[0], ...patch }] }),
      ).toBeNull();
    expect(
      readStackSession({ ...s, pieces: [s.pieces[0], s.pieces[0]] }),
    ).toBeNull();
    expect(ingredientById("base:Roll")).toBeDefined();
  });
});
