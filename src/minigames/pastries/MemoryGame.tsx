import { useEffect, useRef, useState } from "react";
import { answerRecipe, memoryPattern, type PastrySession } from "./rules";
import { WorkBoard } from "./Presentation";
export const bowlNames = [
  "Moonberries",
  "Vanilla cloud",
  "Sugar pearls",
  "Rose petals",
];
const colors = ["#a77cbd", "#f2ddb7", "#d6e4b9", "#eca6b4"];
export function MemoryGame({
  session: s,
  commit,
  tone,
  watchToken,
}: {
  session: PastrySession;
  commit: (s: PastrySession) => void;
  tone: (n?: number, d?: number) => void;
  watchToken: number;
}) {
  const [watching, setWatching] = useState(true),
    [flash, setFlash] = useState<number | null>(null),
    [feedback, setFeedback] = useState(
      "Watch the bowls, then repeat their order.",
    );
  const [replay, setReplay] = useState(0);
  const sound = useRef(tone);
  sound.current = tone;
  const pattern = memoryPattern(s.seed + s.part);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let step = -1;
    let stopped = false;
    setWatching(true);
    setFlash(null);
    const tick = () => {
      if (stopped) return;
      step++;
      if (step >= 8) {
        setFlash(null);
        setWatching(false);
        return;
      }
      if (step % 2 === 0) {
        const bowl = pattern[step / 2];
        setFlash(bowl);
        sound.current(330 + bowl * 100, 0.18);
      } else setFlash(null);
      timer = setTimeout(tick, step % 2 === 0 ? 620 : 220);
    };
    timer = setTimeout(tick, 400);
    const hide = () => {
      if (document.hidden) {
        stopped = true;
        clearTimeout(timer);
        setFlash(null);
        setWatching(false);
        setFeedback("Recipe paused. Replay it whenever you like.");
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [replay, watchToken]);
  const choose = (bowl: number) => {
    if (watching) return;
    const next = answerRecipe(s, bowl);
    setFeedback(
      next.mistakes > s.mistakes
        ? "That bowl comes later. Try another."
        : "A lovely layer.",
    );
    tone(next.mistakes > s.mistakes ? 180 : 440 + bowl * 80, 0.1);
    commit(next);
  };
  return (
    <>
      <div className="signature-direction">
        <h3>The recipe whispers four ingredients.</h3>
        <p>
          {watching
            ? "Watch which bowls glow, and remember their order."
            : "Tap the bowls in the order you saw. Replay is always free."}
        </p>
      </div>
      <WorkBoard label="Tart filling board">
        <ellipse
          cx="400"
          cy="250"
          rx="185"
          ry="110"
          fill="#ebc48c"
          stroke="#ae7852"
          strokeWidth="7"
        />
        <ellipse cx="400" cy="240" rx="160" ry="90" fill="#e6efd4" />
        {s.answers.map((b, i) => (
          <g key={i}>
            <circle
              cx={310 + i * 60}
              cy={220 + (i % 2) * 35}
              r="24"
              fill={colors[b]}
              stroke="#fff4da"
              strokeWidth="4"
            />
            <text
              x={310 + i * 60}
              y={227 + (i % 2) * 35}
              textAnchor="middle"
              fontSize="19"
              fill="#453b48"
            >
              {i + 1}
            </text>
          </g>
        ))}
        <text x="400" y="405" textAnchor="middle" fontSize="21" fill="#fff0d4">
          {watching ? "Watch…" : `${s.answers.length} / 4 layers remembered`}
        </text>
      </WorkBoard>
      <div className="memory-pattern" aria-label="Recipe sequence">
        {pattern.map((b, i) => (
          <span key={i} className={s.answers.length > i ? "remembered" : ""}>
            {s.assisted || s.answers.length > i
              ? `${i + 1}. ${bowlNames[b]}`
              : "?"}
          </span>
        ))}
      </div>
      <div className="ingredient-bowls">
        {bowlNames.map((name, i) => (
          <button
            key={name}
            disabled={watching}
            className={flash === i ? "flashing" : ""}
            style={{ "--bowl-color": colors[i] } as React.CSSProperties}
            onClick={() => choose(i)}
          >
            <span aria-hidden="true">{["●", "☁", "✦", "❀"][i]}</span>
            {name}
            {flash === i && <small>Remember me!</small>}
          </button>
        ))}
      </div>
      <div className="signature-actions">
        <button disabled={watching} onClick={() => setReplay((n) => n + 1)}>
          Watch recipe again
        </button>
        <span role="status">
          {watching ? "The bowls are speaking…" : feedback}
        </span>
      </div>
    </>
  );
}
