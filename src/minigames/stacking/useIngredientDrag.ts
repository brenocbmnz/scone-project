import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
export interface DragItem {
  ingredientId: string;
  sourceId?: number;
  clientX: number;
  clientY: number;
}
interface Gesture extends DragItem {
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
  target: HTMLElement;
}
interface Options {
  onSelect: (ingredientId: string) => void;
  onRelease: (item: DragItem) => void;
}
export function useIngredientDrag(options: Options) {
  const [drag, setDrag] = useState<DragItem | null>(null);
  const current = useRef<Gesture | null>(null);
  const callbacks = useRef(options);
  callbacks.current = options;
  const suppressClick = useRef(false);
  const canceledPointer = useRef<number | null>(null);
  const begin = (
    e: ReactPointerEvent<HTMLElement>,
    ingredientId: string,
    sourceId?: number,
  ) => {
    if (e.button !== 0 || current.current) return;
    callbacks.current.onSelect(ingredientId);
    current.current = {
      ingredientId,
      sourceId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      clientX: e.clientX,
      clientY: e.clientY,
      active: false,
      target: e.currentTarget,
    };
    suppressClick.current = false;
    canceledPointer.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  useEffect(() => {
    const clear = () => {
      const g = current.current;
      current.current = null;
      setDrag(null);
      if (g?.target.hasPointerCapture(g.pointerId))
        g.target.releasePointerCapture(g.pointerId);
    };
    const move = (e: PointerEvent) => {
      const g = current.current;
      if (!g || e.pointerId !== g.pointerId) return;
      if (
        !g.active &&
        Math.hypot(e.clientX - g.startX, e.clientY - g.startY) < 5
      )
        return;
      g.active = true;
      g.clientX = e.clientX;
      g.clientY = e.clientY;
      if (e.cancelable) e.preventDefault();
      setDrag({
        ingredientId: g.ingredientId,
        sourceId: g.sourceId,
        clientX: g.clientX,
        clientY: g.clientY,
      });
    };
    const up = (e: PointerEvent) => {
      const g = current.current;
      if (!g || g.pointerId !== e.pointerId) {
        if (canceledPointer.current === e.pointerId) {
          suppressClick.current = true;
          canceledPointer.current = null;
          setTimeout(() => {
            suppressClick.current = false;
          }, 0);
        }
        return;
      }
      if (g.active) {
        suppressClick.current = true;
        setTimeout(() => {
          suppressClick.current = false;
        }, 0);
        callbacks.current.onRelease({
          ...g,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      }
      clear();
    };
    const cancel = (e?: PointerEvent) => {
      if (e && e.pointerId !== current.current?.pointerId) return;
      if (current.current) {
        canceledPointer.current = current.current.pointerId;
        suppressClick.current = true;
      }
      if (e) {
        canceledPointer.current = null;
        setTimeout(() => {
          suppressClick.current = false;
        }, 0);
      }
      clear();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && current.current) {
        e.preventDefault();
        e.stopPropagation();
        cancel();
      }
    };
    const hidden = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    const blur = () => cancel();
    window.addEventListener("blur", blur);
    document.addEventListener("keydown", key, true);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", blur);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("visibilitychange", hidden);
      clear();
    };
  }, []);
  const consumeClick = () => {
    const skip = suppressClick.current;
    suppressClick.current = false;
    return skip;
  };
  return { drag, begin, consumeClick };
}
