import { useEffect, useRef, useState } from "react";
import { bakeRating, freshBaking, type BakingSession } from "./session";
export function useBaking(
  recipeId: string,
  draft: BakingSession | null,
  onDraft: (s: BakingSession) => void,
) {
  const [session, setSession] = useState(() =>
    draft?.recipeId === recipeId ? draft : freshBaking(recipeId),
  );
  const [running, setRunning] = useState(false);
  const current = useRef(session);
  const save = useRef(onDraft);
  save.current = onDraft;
  const commit = (next: BakingSession) => {
    current.current = next;
    setSession(next);
    save.current(next);
  };
  useEffect(() => {
    save.current(current.current);
    return () => save.current(current.current);
  }, []);
  useEffect(() => {
    if (!running) return;
    let frame = 0,
      previous = performance.now(),
      saved = previous;
    const pause = () => {
      if (document.hidden) {
        setRunning(false);
        save.current(current.current);
      }
    };
    const tick = (now: number) => {
      if (document.hidden) {
        pause();
        return;
      }
      const s = current.current;
      const heat = Math.min(100, s.heat + Math.min(80, now - previous) / 70);
      previous = now;
      const done = s.assisted && heat >= 70;
      const next = {
        ...s,
        heat: done ? 70 : heat,
        ...(done ? { stage: "finish" as const, bakeRating: 2 } : {}),
      };
      current.current = next;
      setSession(next);
      if (now - saved >= 250 || done || heat === 100) {
        save.current(next);
        saved = now;
      }
      if (done || heat === 100) setRunning(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", pause);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", pause);
      save.current(current.current);
    };
  }, [running]);
  const takeOut = () => {
    setRunning(false);
    commit({
      ...current.current,
      stage: "finish",
      bakeRating: bakeRating(current.current.heat),
    });
  };
  return {
    session,
    commit,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    takeOut,
  };
}
