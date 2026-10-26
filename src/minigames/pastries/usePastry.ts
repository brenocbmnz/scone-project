import { useCallback, useEffect, useRef, useState } from "react";
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
  const onFrame = useRef<((s: PastrySession) => void) | null>(null);
  const commit = useCallback((next: PastrySession, persist = true) => {
    current.current = next;
    setSession(next);
    if (persist) save.current(next);
  }, []);
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
      const previous = current.current;
      const next = advanceRhythm(
        previous,
        previous.elapsed + Math.max(0, now - last),
      );
      last = now;
      const persist = now - saved >= 200 || next.stage === "result";
      // The clock and visual frame bypass React. Only discrete game events render UI.
      if (
        next.beats.length !== previous.beats.length ||
        next.stage !== previous.stage
      ) {
        commit(next, persist);
      } else {
        current.current = next;
        if (persist) save.current(next);
      }
      if (next.stage === "play") onFrame.current?.(next);
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
  return { session, current, commit, running, setRunning, onFrame };
}
