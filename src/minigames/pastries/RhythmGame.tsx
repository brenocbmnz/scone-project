import { useEffect, useRef, useState } from "react";
import { beatAt, knead, rhythmWindow, type PastrySession } from "./rules";
import { WorkBoard } from "./Presentation";
export function RhythmGame({
  session: s,
  current,
  commit,
  running,
  setRunning,
  tone,
}: {
  session: PastrySession;
  current: React.RefObject<PastrySession>;
  commit: (s: PastrySession) => void;
  running: boolean;
  setRunning: (r: boolean) => void;
  tone: (n?: number, d?: number) => void;
}) {
  const [feedback, setFeedback] = useState("Follow the heartbeat.");
  const [squash, setSquash] = useState(0);
  const cue = useRef(-1),
    tapRef = useRef(() => {});
  const next = s.beats.length;
  const remaining = beatAt(next) - s.elapsed;
  useEffect(() => {
    if (running && remaining <= 30 && cue.current !== next) {
      cue.current = next;
      tone(330, 0.09);
    }
  }, [remaining, next, running, tone]);
  const tap = () => {
    if (!running) return;
    const before = current.current;
    const after = knead(before);
    setSquash((n) => n + 1);
    if (after === before) {
      setFeedback("A little early. Follow the next pulse.");
      tone(170, 0.06);
    } else {
      setFeedback(
        after.beats.at(-1) === 2 ? "Perfect knead!" : "Lovely rhythm!",
      );
      tone(550, 0.08);
      commit(after);
    }
  };
  tapRef.current = tap;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        ![" ", "Enter"].includes(e.key) ||
        e.repeat ||
        (e.target as Element).closest("button,input")
      )
        return;
      e.preventDefault();
      tapRef.current();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const radius = 118 + Math.max(0, Math.min(1, remaining / 1050)) * 70;
  const ready = Math.abs(remaining) <= rhythmWindow(s.assisted);
  return (
    <>
      <div className="signature-direction">
        <h3>Knead with the hearth’s heartbeat.</h3>
        <p>
          Tap as the moving ring meets the dough. Six beats, with room for
          little mistakes.
        </p>
      </div>
      <WorkBoard label="Rhythm kneading board">
        <circle
          cx="400"
          cy="220"
          r={radius}
          fill="none"
          stroke={ready ? "#cce9bd" : "#f8ddb3"}
          strokeWidth="8"
          opacity={running ? 0.85 : 0.25}
        />
        <circle
          cx="400"
          cy="220"
          r="118"
          fill="none"
          stroke="#fff4cf"
          strokeWidth="4"
          strokeDasharray="7 8"
        />
        <g key={squash} className="knead-dough">
          <ellipse
            cx="400"
            cy="240"
            rx="110"
            ry="75"
            fill="#f5d5a0"
            stroke="#b87d53"
            strokeWidth="5"
          />
          <path
            d="M340 225Q400 275 460 225"
            fill="none"
            stroke="#c89467"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
        <text x="400" y="385" textAnchor="middle" fill="#fff0d4" fontSize="20">
          {running
            ? ready
              ? "KNEAD!"
              : "Feel the beat…"
            : "The dough is resting."}
        </text>
      </WorkBoard>
      <div className="rhythm-beats" aria-label="Kneading results">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={
              i >= s.beats.length ? "pending" : s.beats[i] > 0 ? "hit" : "miss"
            }
            aria-label={
              i >= s.beats.length
                ? `Beat ${i + 1} pending`
                : s.beats[i] > 0
                  ? `Beat ${i + 1} hit`
                  : `Beat ${i + 1} missed`
            }
          >
            {i >= s.beats.length ? i + 1 : s.beats[i] > 0 ? "✓" : "·"}
          </span>
        ))}
      </div>
      <div className="signature-actions">
        {running ? (
          <>
            <button className="primary signature-primary" onClick={tap}>
              Knead dough <kbd>Space</kbd>
            </button>
            <button onClick={() => setRunning(false)}>Pause</button>
          </>
        ) : (
          <button
            className="primary signature-primary"
            onClick={() => {
              tone(260, 0.08);
              setRunning(true);
            }}
          >
            Resume kneading
          </button>
        )}
      </div>
      <p className="game-feedback" role="status">
        {feedback}
      </p>
    </>
  );
}
