import { createPortal } from "react-dom";
import type { RefObject } from "react";
import { IngredientIcon } from "./IngredientArt";
import { ingredientById } from "./ingredients";
import { placementAt, WORLD, type StackSession } from "./physics";
import type { DragItem } from "./useIngredientDrag";
export function DragPreview({
  drag,
  boardRef,
  session,
}: {
  drag: DragItem | null;
  boardRef: RefObject<HTMLDivElement | null>;
  session: StackSession;
}) {
  if (!drag) return null;
  const ingredient = ingredientById(drag.ingredientId)!;
  const rect = boardRef.current?.querySelector("svg")?.getBoundingClientRect();
  const scale = rect ? rect.width / WORLD.width : 1;
  let x = drag.clientX,
    y = drag.clientY;
  const inside =
    rect &&
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom;
  if (inside) {
    const target = placementAt(
      session.pieces.filter((p) => p.id !== drag.sourceId),
      ingredient.id,
      (x - rect.left) / scale,
      (y - rect.top) / scale,
    );
    x = rect.left + target.x * scale;
    y = rect.top + target.y * scale;
  }
  return createPortal(
    <div
      className="ingredient-in-hand"
      aria-hidden="true"
      style={{ left: x, top: y, width: 220 * scale, height: 116 * scale }}
    >
      <IngredientIcon ingredient={ingredient} />
    </div>,
    document.fullscreenElement ?? document.body,
  );
}
