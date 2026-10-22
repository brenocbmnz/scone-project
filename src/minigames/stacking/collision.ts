import { ingredientById } from "./ingredients";
import {
  contourBounds,
  rotateContours,
  containsPoint,
  type Contour,
} from "./contours";
import type { Piece } from "./physics";
interface Profile {
  contours: Contour[];
  left: number;
  right: number;
  top: number;
  bottom: number;
  offset: number;
  spans: ({ top: number; bottom: number } | null)[];
}
const cache = new Map<string, Profile>();
export function profileFor(id: string, angle = 0): Profile {
  const degrees = Math.round(angle * 2) / 2,
    key = `${id}:${degrees}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const source = ingredientById(id)!;
  const contours = degrees
    ? rotateContours(source.contours, degrees)
    : source.contours;
  const bounds = contourBounds(contours);
  const offset = Math.floor(bounds.left);
  const spans = Array.from(
    { length: Math.ceil(bounds.right) - offset + 1 },
    (_, n) => {
      const x = offset + n;
      const ys: number[] = [];
      for (const points of contours)
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const a = points[j],
            b = points[i];
          if (x < Math.min(a.x, b.x) || x > Math.max(a.x, b.x)) continue;
          if (Math.abs(a.x - b.x) < 1e-7) {
            if (Math.abs(x - a.x) < 1e-7) ys.push(a.y, b.y);
          } else ys.push(a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y));
        }
      return ys.length
        ? { top: Math.min(...ys), bottom: Math.max(...ys) }
        : null;
    },
  );
  const result = { ...bounds, contours, offset, spans };
  if (cache.size > 1500) cache.clear();
  cache.set(key, result);
  return result;
}
function spanAt(profile: Profile, x: number) {
  const index = x - profile.offset,
    left = Math.floor(index),
    t = index - left;
  if (index < 0 || index > profile.spans.length - 1) return null;
  const a = profile.spans[left],
    b = profile.spans[Math.min(left + 1, profile.spans.length - 1)];
  if (!a || !b) return a ?? b;
  return {
    top: a.top + (b.top - a.top) * t,
    bottom: a.bottom + (b.bottom - a.bottom) * t,
  };
}
export interface Contact {
  id: number | "plate";
  left: number;
  right: number;
  y: number;
  overlap: number;
}
export function contactWithSurface(
  ingredientId: string,
  x: number,
  angle: number,
  surface: Piece | { left: number; right: number; y: number },
): Contact | null {
  const upper = profileFor(ingredientId, angle);
  const lower =
    "ingredientId" in surface
      ? profileFor(surface.ingredientId, surface.angle)
      : null;
  const left = lower
    ? (surface as Piece).x + lower.left
    : (surface as { left: number }).left;
  const right = lower
    ? (surface as Piece).x + lower.right
    : (surface as { right: number }).right;
  const overlapLeft = Math.max(x + upper.left, left),
    overlapRight = Math.min(x + upper.right, right);
  if (overlapRight - overlapLeft < 0.5) return null;
  let y = Infinity,
    overlap = 0;
  for (let at = overlapLeft + 0.25; at < overlapRight; at += 0.5) {
    const a = spanAt(upper, at - x);
    const b = lower
      ? spanAt(lower, at - (surface as Piece).x)
      : { top: 0, bottom: 0 };
    if (!a || !b) continue;
    y = Math.min(y, surface.y + b.top - a.bottom);
    overlap += 0.5;
  }
  return Number.isFinite(y)
    ? { id: "id" in surface ? surface.id : "plate", left, right, y, overlap }
    : null;
}
export const hitPiece = (p: Piece, x: number, y: number) =>
  containsPoint(profileFor(p.ingredientId, p.angle).contours, x - p.x, y - p.y);
