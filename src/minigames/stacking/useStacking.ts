import { useEffect, useRef, useState } from "react";
import {
  freshSession,
  isMoving,
  stepPieces,
  type StackSession,
} from "./physics";
export function useStacking(
  recipeId: string,
  draft: StackSession | null,
  onDraft: (s: StackSession) => void,
) {
  const [session, setSession] = useState(() =>
    draft?.recipeId === recipeId ? draft : freshSession(recipeId),
  );
  const current = useRef(session);
  const save = useRef(onDraft);
  save.current = onDraft;
  const apply = (next: StackSession, persist = true) => {
    current.current = next;
    setSession(next);
    if (persist) save.current(next);
  };
  useEffect(() => {
    let frame = 0,
      last = 0;
    const animate = (now: number) => {
      if (document.hidden) {
        last = 0;
        frame = requestAnimationFrame(animate);
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      const before = current.current;
      if (!before.served && isMoving(before.pieces)) {
        const pieces = stepPieces(before.pieces, dt);
        const next = { ...before, pieces };
        current.current = next;
        setSession(next);
        if (!isMoving(pieces)) save.current(next);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      save.current(current.current);
    };
  }, []);
  return { session, apply };
}
