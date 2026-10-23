import { createPortal } from "react-dom";
import { useRef, useState, type PointerEvent } from "react";
import {
  correctTiles,
  placeTile,
  targetTurns,
  type PastrySession,
} from "./rules";
import { WorkBoard } from "./Presentation";
const centers = [
  { x: 225, y: 225 },
  { x: 400, y: 265 },
  { x: 575, y: 225 },
];
const names = ["Left curl", "Middle fold", "Right curl"];
const paths = [
  "M-62-65L65 0L-62 65Z",
  "M-86-53L86-53L0 70Z",
  "M-62-65L65 0L-62 65Z",
];
export function DoughPuzzle({
  session: s,
  commit,
  finish,
}: {
  session: PastrySession;
  commit: (s: PastrySession) => void;
  finish: () => void;
}) {
  const [selected, setSelected] = useState(0),
    [drag, setDrag] = useState<{ x: number; y: number; piece: number } | null>(
      null,
    ),
    [feedback, setFeedback] = useState(
      "Choose a piece, rotate it, and match the outline.",
    );
  const board = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    piece: number;
  } | null>(null);
  const history = useRef<PastrySession[]>([]);
  const change = (next: PastrySession) => {
    history.current = [...history.current.slice(-19), s];
    commit(next);
  };
  const place = (piece: number, slot: number) => {
    const next = placeTile(s, piece, slot);
    change(next);
    setFeedback(
      next.tiles[piece] === piece && next.turns[piece] === targetTurns[piece]
        ? "That fold fits beautifully."
        : "Turn the piece to follow the pointed end of the outline.",
    );
  };
  const begin = (e: PointerEvent<HTMLButtonElement>, piece: number) => {
    if (e.button !== 0 || pointer.current) return;
    setSelected(piece);
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, piece };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const release = (e: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    if (!cancel && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) {
      const rect = board.current?.querySelector("svg")?.getBoundingClientRect();
      if (
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = ((e.clientX - rect.left) / rect.width) * 800,
          y = ((e.clientY - rect.top) / rect.height) * 460;
        let slot = -1;
        centers.forEach((c, i) => {
          if (Math.hypot(x - c.x, y - c.y) < 105) slot = i;
        });
        if (slot >= 0) place(p.piece, slot);
        else setFeedback("Release over one of the three outlines.");
      }
    }
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return (
    <>
      <div className="signature-direction">
        <h3>Piece together a moonberry crescent.</h3>
        <p>
          Rotate each dough piece to match its outline. Drag it into place, or
          select a piece and tap a space.
        </p>
      </div>
      <div ref={board} className="puzzle-board">
        <WorkBoard label="Crescent puzzle board">
          {centers.map((p, slot) => (
            <g key={slot} transform={`translate(${p.x} ${p.y})`}>
              <path
                d={paths[slot]}
                transform={`rotate(${targetTurns[slot] * 90})`}
                fill={
                  s.assisted
                    ? ["#f4c0a755", "#e9d2a455", "#b9d7bd55"][slot]
                    : "#f8e7c122"
                }
                stroke="#fff2cb"
                strokeWidth="4"
                strokeDasharray="9 7"
              />
              {s.tiles.map((position, piece) =>
                position !== slot ? null : (
                  <g key={piece}>
                    <path
                      d={paths[piece]}
                      transform={`rotate(${s.turns[piece] * 90})`}
                      fill={["#efba91", "#f5d4a2", "#e6b68c"][piece]}
                      stroke={
                        piece === slot && s.turns[piece] === targetTurns[piece]
                          ? "#baddb5"
                          : "#a9704e"
                      }
                      strokeWidth="5"
                    />
                    <path
                      d="M-20 0Q0 15 20 0"
                      fill="none"
                      stroke="#a574b4"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  </g>
                ),
              )}
              {s.assisted && (
                <text y="105" textAnchor="middle" fill="#fff0d4" fontSize="15">
                  {names[slot]} · turn {targetTurns[slot] + 1}
                </text>
              )}
            </g>
          ))}
        </WorkBoard>
        <div className="puzzle-slots">
          {centers.map((p, i) => (
            <button
              key={i}
              aria-label={`Place selected dough in space ${i + 1}`}
              style={{ left: `${p.x / 8}%`, top: `${p.y / 4.6}%` }}
              onClick={() => place(selected, i)}
            >
              {s.tiles[i] === i && s.turns[i] === targetTurns[i] ? "✓" : i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="dough-tray" aria-label="Dough pieces">
        {names.map((name, i) => (
          <button
            key={name}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            onPointerDown={(e) => begin(e, i)}
            onPointerMove={(e) => {
              const p = pointer.current;
              if (
                p &&
                p.id === e.pointerId &&
                Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6
              )
                setDrag({ x: e.clientX, y: e.clientY, piece: i });
            }}
            onPointerUp={(e) => release(e)}
            onPointerCancel={(e) => release(e, true)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && pointer.current) {
                e.preventDefault();
                e.stopPropagation();
                pointer.current = null;
                setDrag(null);
              }
            }}
          >
            <svg viewBox="-100 -100 200 200" aria-hidden="true">
              <path
                d={paths[i]}
                transform={`rotate(${s.turns[i] * 90})`}
                fill={["#efba91", "#f5d4a2", "#e6b68c"][i]}
                stroke="#ac7954"
                strokeWidth="5"
              />
            </svg>
            <strong>{name}</strong>
            <small>
              {s.tiles[i] === -1
                ? "On the board’s edge"
                : `In space ${s.tiles[i] + 1}`}
            </small>
          </button>
        ))}
      </div>
      {drag &&
        createPortal(
          <div
            className="dough-drag-preview"
            style={{ left: drag.x, top: drag.y }}
            aria-hidden="true"
          >
            <svg viewBox="-100 -100 200 200">
              <path
                d={paths[drag.piece]}
                transform={`rotate(${s.turns[drag.piece] * 90})`}
                fill="#f2c894"
                stroke="#fff0d4"
                strokeWidth="5"
              />
            </svg>
          </div>,
          document.body,
        )}
      <div className="signature-actions">
        <button
          onClick={() => {
            const turns = [...s.turns];
            turns[selected] = (turns[selected] + 1) % 4;
            change({ ...s, turns });
          }}
        >
          Rotate {names[selected].toLowerCase()} ↻
        </button>
        <button
          disabled={!history.current.length}
          onClick={() => {
            const previous = history.current.pop();
            if (previous) commit(previous);
          }}
        >
          Undo fold
        </button>
        <button
          onClick={() =>
            change({ ...s, tiles: [-1, -1, -1], turns: [1, 2, 3] })
          }
        >
          Reset puzzle
        </button>
      </div>
      <p className="game-feedback" role="status">
        {correctTiles(s)} / 3 folds aligned · {feedback}
      </p>
      <button className="primary signature-primary" onClick={finish}>
        Bake my crescent
      </button>
    </>
  );
}
