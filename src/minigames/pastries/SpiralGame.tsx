import { useRef, type PointerEvent } from "react";
import {
  pipeIcing,
  pipeSection,
  spiral,
  type PastrySession,
  type Point,
} from "./rules";
import { WorkBoard } from "./Presentation";
export function SpiralGame({
  session: s,
  current,
  commit,
  finish,
}: {
  session: PastrySession;
  current: React.RefObject<PastrySession>;
  commit: (s: PastrySession) => void;
  finish: () => void;
}) {
  const pointer = useRef<number | null>(null);
  const point = (e: PointerEvent<SVGSVGElement>): Point => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      e.currentTarget.getScreenCTM()!.inverse(),
    );
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };
  const paint = (e: PointerEvent<SVGSVGElement>) => {
    const next = pipeIcing(current.current, point(e));
    if (next !== current.current) commit(next);
  };
  const stop = (e: PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== e.pointerId) return;
    pointer.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const tip = spiral[Math.min(79, s.traced)];
  return (
    <>
      <div className="signature-direction">
        <h3>Follow the spiral with cinnamon icing.</h3>
        <p>
          Start at the glowing tip. Lift and reposition whenever you like. Aim
          to cover most of the spiral.
        </p>
      </div>
      <WorkBoard
        label="Spiral icing board"
        onPointerDown={(e) => {
          if (e.button !== 0 || pointer.current !== null) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          paint(e);
        }}
        onPointerMove={(e) => {
          if (pointer.current === e.pointerId) paint(e);
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <ellipse
          cx="400"
          cy="245"
          rx="210"
          ry="150"
          fill="#e8b878"
          stroke="#b37a51"
          strokeWidth="6"
        />
        <polyline
          points={spiral.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#a46c48"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <polyline
          points={spiral.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#ffe4af"
          strokeWidth={s.assisted ? 20 : 9}
          strokeDasharray="5 10"
          strokeLinecap="round"
          opacity=".8"
        />
        {s.marks.length > 0 && (
          <polyline
            points={s.marks.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#fff4d9"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {s.traced < 80 && (
          <g pointerEvents="none">
            <circle
              cx={tip.x}
              cy={tip.y}
              r="23"
              fill="#ff9b84"
              stroke="#fff3d3"
              strokeWidth="4"
            />
            <text
              x={tip.x}
              y={tip.y + 7}
              textAnchor="middle"
              fontSize="23"
              fill="#24323f"
            >
              ✦
            </text>
          </g>
        )}
      </WorkBoard>
      <div
        className="icing-coverage"
        role="meter"
        aria-label="Spiral coverage"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((s.traced / 80) * 100)}
      >
        <i style={{ width: `${(s.traced / 80) * 100}%` }} />
      </div>
      <p className="game-feedback" role="status">
        {Math.round((s.traced / 80) * 100)}% iced ·{" "}
        {s.traced >= 64
          ? "A lovely spiral! Add more, or finish when you’re happy."
          : "The glowing tip shows where to continue."}
      </p>
      <div className="signature-actions">
        <button
          onClick={() => commit(pipeSection(s))}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              commit(pipeSection(current.current));
            }
          }}
        >
          Pipe next section <kbd>→</kbd>
        </button>
        <button
          disabled={s.traced === 0}
          onClick={() => commit({ ...s, traced: 0, marks: [] })}
        >
          Clear icing
        </button>
        <button className="primary signature-primary" onClick={finish}>
          Bake my roll
        </button>
      </div>
    </>
  );
}
