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
export function addPiece(
  s: StackSession,
  ingredientId: string,
  x: number,
): StackSession {
  if (
    s.served ||
    isMoving(s.pieces) ||
    s.pieces.length >= 12 ||
    !ingredientById(ingredientId)
  )
    return s;
  const top = Math.min(
    90,
    ...s.pieces
      .filter((p) => p.status === "settled")
      .map((p) => p.y - ingredientById(p.ingredientId)!.height / 2 - 80),
  );
  return {
    ...s,
    nextId: s.nextId + 1,
    pieces: [
      ...s.pieces,
      {
        id: s.nextId,
        ingredientId,
        x: Math.max(45, Math.min(755, x)),
        y: Math.max(30, top),
        vx: 0,
        vy: 0,
        angle: 0,
        status: "falling",
        support: null,
      },
    ],
  };
}
function surfaceFor(p: Piece, pieces: readonly Piece[], dt: number) {
  const ingredient = ingredientById(p.ingredientId)!;
  const bottom = p.y + ingredient.height / 2;
  const nextBottom = bottom + p.vy * dt + 950 * dt * dt;
  const surfaces = [
    {
      id: "plate" as number | "plate",
      left: WORLD.plateLeft,
      right: WORLD.plateRight,
      top: WORLD.plateY,
    },
    ...pieces
      .filter((o) => o.id !== p.id && o.status === "settled")
      .map((o) => {
        const i = ingredientById(o.ingredientId)!;
        return {
          id: o.id,
          left: o.x - i.width / 2,
          right: o.x + i.width / 2,
          top: o.y - i.height / 2,
        };
      }),
  ];
  return surfaces
    .filter(
      (s) =>
        bottom <= s.top + 3 &&
        nextBottom >= s.top &&
        p.x + ingredient.width / 2 > s.left &&
        p.x - ingredient.width / 2 < s.right,
    )
    .sort((a, b) => a.top - b.top)[0];
}
export function stepPieces(input: readonly Piece[], delta: number): Piece[] {
  const dt = Math.max(0, Math.min(delta, 1 / 30));
  return input.map((original) => {
    if (original.status === "settled" || original.status === "lost")
      return original;
    const p = { ...original };
    const i = ingredientById(p.ingredientId)!;
    if (p.status === "sliding") {
      const support =
        p.support === "plate"
          ? {
              left: WORLD.plateLeft,
              right: WORLD.plateRight,
              top: WORLD.plateY,
            }
          : input.find((o) => o.id === p.support && o.status === "settled");
      if (!support) {
        p.status = "falling";
        p.support = null;
      } else {
        const bounds =
          "left" in support
            ? support
            : {
                left:
                  support.x - ingredientById(support.ingredientId)!.width / 2,
                right:
                  support.x + ingredientById(support.ingredientId)!.width / 2,
                top:
                  support.y - ingredientById(support.ingredientId)!.height / 2,
              };
        p.x += p.vx * dt;
        p.angle += Math.sign(p.vx) * dt * 35;
        p.y = bounds.top - i.height / 2;
        if (
          p.x - i.width / 2 >= bounds.right ||
          p.x + i.width / 2 <= bounds.left
        ) {
          p.status = "falling";
          p.support = null;
          p.vy = 35;
        }
        return p;
      }
    }
    const surface = surfaceFor(p, input, dt);
    p.vy += 950 * dt;
    p.x += p.vx * dt;
    if (surface) {
      p.y = surface.top - i.height / 2;
      const overlap = Math.max(
        0,
        Math.min(p.x + i.width / 2, surface.right) -
          Math.max(p.x - i.width / 2, surface.left),
      );
      const stable =
        p.x >= surface.left - 8 &&
        p.x <= surface.right + 8 &&
        overlap >= i.width * 0.24;
      if (stable) {
        p.status = "settled";
        p.vx = 0;
        p.vy = 0;
        p.angle = 0;
        p.support = surface.id;
      } else {
        p.status = "sliding";
        p.vx = (p.x < (surface.left + surface.right) / 2 ? -1 : 1) * 155;
        p.vy = 0;
        p.support = surface.id;
      }
    } else p.y += p.vy * dt;
    if (p.y + i.height / 2 >= WORLD.floorY || p.x < -100 || p.x > 900) {
      p.status = "lost";
      p.support = null;
      p.y = WORLD.floorY - i.height / 2;
      p.vx = 0;
      p.vy = 0;
      p.angle = p.x < 400 ? -18 : 18;
    }
    return p;
  });
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
    return s;
  } catch {
    return null;
  }
}
