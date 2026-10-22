import { describe, it, expect } from "vitest";
import { ingredients, ingredientById } from "./ingredients";
import { contourBounds, containsPoint } from "./contours";
import { contactWithSurface, profileFor, hitPiece } from "./collision";
import {
  freshSession,
  addPiece,
  placementAt,
  stepPieces,
  isMoving,
  canLiftPiece,
  readStackSession,
  WORLD,
  type StackSession,
} from "./physics";
function settle(s: StackSession) {
  let pieces = s.pieces;
  for (let n = 0; n < 3000 && isMoving(pieces); n++)
    pieces = stepPieces(pieces, 1 / 120);
  expect(isMoving(pieces)).toBe(false);
  return { ...s, pieces };
}
describe("shared art and collision contours", () => {
  it.each(ingredients)(
    "derives the $name hitbox from its actual silhouette",
    (i) => {
      const bounds = contourBounds(i.contours);
      expect(i.width).toBe(bounds.right - bounds.left);
      expect(i.height).toBe(bounds.bottom - bounds.top);
      expect(profileFor(i.id)).toMatchObject(bounds);
    },
  );
  it.each(ingredients)(
    "rests $name against the plate with no invisible rectangular gap",
    (i) => {
      const s = settle(addPiece(freshSession("test"), i.id, 400));
      const p = s.pieces[0];
      expect(p.status).toBe("settled");
      expect(
        Math.abs(p.y + contourBounds(i.contours).bottom - WORLD.plateY),
      ).toBeLessThan(0.15);
    },
  );
  it("does not pick an empty corner inside a round bun bounding box", () => {
    const p = settle(addPiece(freshSession("test"), "base:Bun", 400)).pieces[0];
    const bounds = profileFor(p.ingredientId);
    expect(hitPiece(p, p.x + bounds.left + 1, p.y + bounds.top + 1)).toBe(
      false,
    );
    expect(hitPiece(p, p.x, p.y)).toBe(true);
  });
  it("matches the rounded shoulder of a bun, rather than a flat top edge", () => {
    const s = settle(addPiece(freshSession("test"), "base:Bun", 400));
    const base = s.pieces[0];
    const contact = contactWithSurface("filling:Moonberry", 465, 0, base)!;
    const rectangularY =
      base.y +
      profileFor(base.ingredientId).top -
      profileFor("filling:Moonberry").bottom;
    expect(contact.y).toBeGreaterThan(rectangularY + 3);
    const upper = ingredientById("filling:Moonberry")!;
    const below = ingredientById("base:Bun")!;
    let overlap = 0;
    for (let x = 425; x < 480; x += 2)
      for (let y = base.y - 45; y < base.y + 10; y += 2)
        if (
          containsPoint(upper.contours, x - 465, y - contact.y) &&
          containsPoint(below.contours, x - base.x, y - base.y)
        )
          overlap++;
    expect(overlap).toBe(0);
  });
});
describe("direct placement and repositioning", () => {
  it("starts placement just above the target rather than at the top of the screen", () => {
    const s = addPiece(freshSession("test"), "base:Crescent", 400);
    expect(s.pieces[0].y).toBeGreaterThan(300);
    const position = placementAt([], "base:Crescent", 400);
    expect(position.landing - position.y).toBe(8);
  });
  it("honors the released height when a player deliberately holds an item higher", () => {
    const s = addPiece(freshSession("test"), "base:Crescent", 400, 230);
    expect(s.pieces[0].y).toBe(230);
  });
  it("clamps a release inside the stack to its non-penetrating contour contact", () => {
    const s = settle(addPiece(freshSession("test"), "base:Roll", 400));
    const placed = addPiece(s, "filling:Cinnamon icing", 400, 450);
    const p = placed.pieces.at(-1)!;
    expect(p.y).toBe(
      contactWithSurface(p.ingredientId, p.x, 0, s.pieces[0])!.y,
    );
    expect(settle(placed).pieces.at(-1)?.status).toBe("settled");
  });
  it("allows moving an exposed ingredient without creating a duplicate", () => {
    let s = settle(addPiece(freshSession("test"), "base:Roll", 400));
    s = settle(addPiece(s, "filling:Cinnamon icing", 400));
    expect(canLiftPiece(s.pieces[0], s.pieces)).toBe(false);
    expect(canLiftPiece(s.pieces[1], s.pieces)).toBe(true);
    const moved = settle(
      addPiece(s, "filling:Cinnamon icing", 420, 330, s.pieces[1].id),
    );
    expect(moved.pieces).toHaveLength(2);
    expect(moved.pieces[1].x).toBe(420);
    expect(readStackSession(moved)).not.toBeNull();
    expect(addPiece(s, "base:Roll", 500, 350, s.pieces[0].id)).toBe(s);
  });
  it("refits older box-based saves while preserving item identities and quantities", () => {
    const s = settle(addPiece(freshSession("test"), "base:Roll", 400));
    const old = { ...s, pieces: [{ ...s.pieces[0], y: 333 }] };
    const restored = readStackSession(old)!;
    expect(restored.pieces[0].id).toBe(s.pieces[0].id);
    expect(restored.pieces[0].y).toBe(s.pieces[0].y);
  });
});
