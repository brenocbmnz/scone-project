import { useEffect, useRef, useState } from "react";
import {
  advanceRhythm,
  freshPastry,
  type PastrySession,
  type RecipeId,
} from "./rules";
export function usePastry(
  ids: RecipeId[],
  seed: number,
  draft: PastrySession | null,
  onDraft: (s: PastrySession) => void,
) {
  const [session, setSession] = useState(() => draft ?? freshPastry(ids, seed));
  const [running, setRunning] = useState(false);
  const current = useRef(session),
    save = useRef(onDraft);
  save.current = onDraft;
  const commit = (next: PastrySession, persist = true) => {
    current.current = next;
    setSession(next);
    if (persist) save.current(next);
  };
  useEffect(() => {
    save.current(current.current);
    return () => save.current(current.current);
  }, []);
  useEffect(() => {
    if (!running) return;
    let raf = 0,
      last = performance.now(),
      saved = last;
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    const tick = (now: number) => {
      if (document.hidden) {
        pause();
        return;
      }
      const next = advanceRhythm(
        current.current,
        current.current.elapsed + Math.min(80, now - last),
      );
      last = now;
      const persist = now - saved >= 200 || next.stage === "result";
      commit(next, persist);
      if (persist) saved = now;
      if (next.stage === "result") setRunning(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", pause);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", pause);
      save.current(current.current);
    };
  }, [running]);
  return { session, current, commit, running, setRunning };
}
