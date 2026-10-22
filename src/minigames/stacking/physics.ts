import { contactWithSurface, profileFor, type Contact } from "./collision";
import { ingredientById, type Requirement, type Category } from "./ingredients";
export const WORLD = {
  width: 800,
  height: 520,
  plateLeft: 173,
  plateRight: 627,
  plateY: 392,
  floorY: 497,
};
export interface Piece {
  id: number;
  ingredientId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  status: "falling" | "sliding" | "settled" | "lost";
  support: number | "plate" | null;
}
export interface StackSession {
  recipeId: string;
  pieces: Piece[];
  nextId: number;
  selected: string | null;
  category: Category;
  aim: number;
  served: boolean;
}
export const freshSession = (recipeId: string): StackSession => ({
  recipeId,
  pieces: [],
  nextId: 1,
  selected: null,
  category: "base",
  aim: 400,
  served: false,
});
export const isMoving = (pieces: readonly Piece[]) =>
  pieces.some((p) => p.status === "falling" || p.status === "sliding");
const plate = {
  left: WORLD.plateLeft,
  right: WORLD.plateRight,
  y: WORLD.plateY,
};
export function contactsAt(
  pieces: readonly Piece[],
  ingredientId: string,
  x: number,
  angle = 0,
): Contact[] {
  return [
    contactWithSurface(ingredientId, x, angle, plate),
    ...pieces
      .filter((p) => p.status === "settled")
      .map((p) => contactWithSurface(ingredientId, x, angle, p)),
  ]
    .filter((c): c is Contact => !!c)
    .sort((a, b) => a.y - b.y);
}
export function placementAt(
  pieces: readonly Piece[],
  ingredientId: string,
  x: number,
  y?: number,
) {
  const safeX = Math.max(45, Math.min(755, x));
  const contact = contactsAt(pieces, ingredientId, safeX)[0];
  const floor = WORLD.floorY - profileFor(ingredientId).bottom;
  const landing = contact?.y ?? floor;
  return {
    x: safeX,
    y: y === undefined ? landing - 8 : Math.max(-800, Math.min(y, landing)),
    landing,
  };
}
export function canLiftPiece(piece: Piece, pieces: readonly Piece[]) {
  return !isMoving(pieces) && !pieces.some((p) => p.support === piece.id);
}
export function addPiece(
  s: StackSession,
  ingredientId: string,
  x: number,
  y?: number,
  sourceId?: number,
): StackSession {
  const source =
    sourceId === undefined ? null : s.pieces.find((p) => p.id === sourceId);
  if (
    s.served ||
    isMoving(s.pieces) ||
    !ingredientById(ingredientId) ||
    (sourceId !== undefined &&
      (!source ||
        source.ingredientId !== ingredientId ||
        !canLiftPiece(source, s.pieces))) ||
    (!source && s.pieces.length >= 12)
  )
    return s;
  const remaining = s.pieces.filter((p) => p.id !== sourceId);
  const position = placementAt(remaining, ingredientId, x, y);
  return {
    ...s,
    nextId: s.nextId + 1,
    pieces: [
      ...remaining,
      {
        id: s.nextId,
        ingredientId,
        x: position.x,
        y: position.y,
        vx: 0,
        vy: 0,
        angle: 0,
        status: "falling",
        support: null,
      },
    ],
  };
}
export function stepPieces(input: readonly Piece[], delta: number): Piece[] {
  const dt = Math.max(0, Math.min(delta, 1 / 30));
  return input.map((original) => {
    if (original.status === "settled" || original.status === "lost")
      return original;
    const p = { ...original };
    if (p.status === "sliding") {
      p.x += p.vx * dt;
      p.angle += Math.sign(p.vx) * dt * 35;
      const support =
        p.support === "plate"
          ? plate
          : input.find((o) => o.id === p.support && o.status === "settled");
      const contact = support
        ? contactWithSurface(p.ingredientId, p.x, p.angle, support)
        : null;
      if (contact) {
        p.y = contact.y;
        return p;
      }
      p.status = "falling";
      p.support = null;
      p.vy = 35;
    }
    p.vy += 950 * dt;
    p.x += p.vx * dt;
    const nextY = p.y + p.vy * dt;
    const contact = contactsAt(
      input.filter((o) => o.id !== p.id),
      p.ingredientId,
      p.x,
      p.angle,
    ).find((c) => p.y <= c.y + 2 && nextY >= c.y);
    if (contact) {
      // Resting pieces have no rotation; recalculate the same contour contact at that pose.
      const surface =
        contact.id === "plate"
          ? plate
          : input.find((o) => o.id === contact.id)!;
      const overlap = contact.overlap,
        profile = profileFor(p.ingredientId, p.angle);
      const stable =
        p.x >= contact.left - 6 &&
        p.x <= contact.right + 6 &&
        overlap >= (profile.right - profile.left) * 0.2;
      if (stable) {
        p.angle = 0;
        p.y = contactWithSurface(p.ingredientId, p.x, 0, surface)!.y;
        p.status = "settled";
        p.vx = 0;
        p.vy = 0;
        p.support = contact.id;
      } else {
        p.y = contact.y;
        p.status = "sliding";
        p.vx = (p.x < (contact.left + contact.right) / 2 ? -1 : 1) * 155;
        p.vy = 0;
        p.support = contact.id;
      }
    } else p.y = nextY;
    const bottom = profileFor(p.ingredientId, p.angle).bottom;
    if (p.y + bottom >= WORLD.floorY || p.x < -100 || p.x > 900) {
      p.status = "lost";
      p.support = null;
      p.vx = 0;
      p.vy = 0;
      p.angle = p.x < 400 ? -18 : 18;
      p.y = WORLD.floorY - profileFor(p.ingredientId, p.angle).bottom;
    }
    return p;
  });
}
// Refit old rectangular-hitbox saves without changing ingredients, points, or money.
export function reconcilePieces(pieces: readonly Piece[]): Piece[] {
  const fixed: Piece[] = [];
  for (const original of pieces) {
    const p = { ...original };
    if (p.status === "settled") {
      const support =
        p.support === "plate" ? plate : fixed.find((b) => b.id === p.support);
      const contact = support
        ? contactWithSurface(p.ingredientId, p.x, p.angle, support)
        : null;
      if (contact) p.y = contact.y;
    } else if (p.status === "lost")
      p.y = WORLD.floorY - profileFor(p.ingredientId, p.angle).bottom;
    else {
      const contact = contactsAt(fixed, p.ingredientId, p.x, p.angle)[0];
      if (contact) p.y = Math.min(p.y, contact.y);
    }
    fixed.push(p);
  }
  return fixed;
}
export function onPlate(
  piece: Piece,
  pieces: readonly Piece[],
  visited = new Set<number>(),
): boolean {
  if (piece.status !== "settled" || visited.has(piece.id)) return false;
  if (piece.support === "plate") return true;
  visited.add(piece.id);
  const below = pieces.find((p) => p.id === piece.support);
  return !!below && onPlate(below, pieces, visited);
}
export function scoreStack(
  pieces: readonly Piece[],
  requirements: readonly Requirement[],
) {
  const standing = pieces.filter((p) => onPlate(p, pieces));
  const details = requirements.map((r) => ({
    ...r,
    standing: standing.filter((p) => p.ingredientId === r.ingredientId).length,
  }));
  const points = details.reduce(
    (sum, r) => sum + Math.min(r.count, r.standing),
    0,
  );
  const total = requirements.reduce((sum, r) => sum + r.count, 0);
  return {
    points,
    total,
    details,
    standing: standing.length,
    payoutScore: total ? Math.round((points / total) * 3) : 0,
  };
}
export function readStackSession(value: unknown): StackSession | null {
  try {
    if (!value || typeof value !== "object") return null;
    const s = value as StackSession;
    if (
      typeof s.recipeId !== "string" ||
      !["base", "filling", "topping"].includes(s.category) ||
      typeof s.served !== "boolean" ||
      !Number.isFinite(s.aim) ||
      s.aim < 45 ||
      s.aim > 755 ||
      !Number.isSafeInteger(s.nextId) ||
      s.nextId < 1 ||
      !Array.isArray(s.pieces) ||
      s.pieces.length > 12 ||
      (s.selected !== null && !ingredientById(s.selected))
    )
      return null;
    const ids = new Set<number>();
    for (const p of s.pieces) {
      if (
        !p ||
        !Number.isSafeInteger(p.id) ||
        p.id < 1 ||
        p.id >= s.nextId ||
        ids.has(p.id) ||
        !ingredientById(p.ingredientId) ||
        !["falling", "sliding", "settled", "lost"].includes(p.status) ||
        ![p.x, p.y, p.vx, p.vy, p.angle].every(Number.isFinite) ||
        Math.abs(p.x) > 1500 ||
        Math.abs(p.y) > 1500 ||
        Math.abs(p.vx) > 2000 ||
        Math.abs(p.vy) > 5000 ||
        Math.abs(p.angle) > 10000 ||
        !(
          p.support === null ||
          p.support === "plate" ||
          (typeof p.support === "number" &&
            Number.isSafeInteger(p.support) &&
            p.support < p.id)
        )
      )
        return null;
      ids.add(p.id);
    }
    if (
      s.pieces.filter((p) => p.status === "falling" || p.status === "sliding")
        .length > 1
    )
      return null;
    for (const p of s.pieces)
      if (typeof p.support === "number" && !ids.has(p.support)) return null;
    return { ...s, pieces: reconcilePieces(s.pieces) };
  } catch {
    return null;
  }
}
