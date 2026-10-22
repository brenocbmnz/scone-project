import type { RefObject, PointerEvent } from "react";
import type { DragItem } from "./useIngredientDrag";
import { hitPiece } from "./collision";
import { IngredientShape } from "./IngredientArt";
import { ingredientById, type Ingredient } from "./ingredients";
import { WORLD, placementAt, canLiftPiece, type StackSession } from "./physics";
interface Props {
  boardRef: RefObject<HTMLDivElement | null>;
  drag: DragItem | null;
  beginDrag: (
    e: PointerEvent<HTMLElement>,
    ingredientId: string,
    sourceId?: number,
  ) => void;
  consumeClick: () => boolean;
  session: StackSession;
  selected: Ingredient | null;
  moving: boolean;
  spilled: number;
  aim: (x: number) => void;
  drop: (x?: number) => void;
}
export function StackBoard({
  boardRef,
  drag,
  beginDrag,
  consumeClick,
  session: s,
  selected,
  moving,
  spilled,
  aim,
  drop,
}: Props) {
  const point = (clientX: number, clientY: number) => {
    const rect = boardRef
      .current!.querySelector("svg")!
      .getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * WORLD.width,
      y: ((clientY - rect.top) / rect.height) * WORLD.height,
    };
  };
  const hitAt = (x: number, y: number) =>
    [...s.pieces].reverse().find((p) => hitPiece(p, x, y));
  const preview = selected ? placementAt(s.pieces, selected.id, s.aim) : null;
  return (
    <div className="stack-board" ref={boardRef}>
      <svg
        viewBox="0 0 800 520"
        role="img"
        aria-label="Side view of your pastry stack on a plate"
      >
        <defs>
          <linearGradient id="stack-wall" x2="0" y2="1">
            <stop stopColor="#c0c1b0" />
            <stop offset="1" stopColor="#e1d6bb" />
          </linearGradient>
          <linearGradient id="stack-wood" x2="0" y2="1">
            <stop stopColor="#c49e7a" />
            <stop offset="1" stopColor="#a87c60" />
          </linearGradient>
          <pattern
            id="stack-grain"
            width="220"
            height="58"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 12Q100 2 220 14M0 38Q80 49 220 32M30 55Q140 43 200 55"
              stroke="#795846"
              strokeWidth="1"
              opacity=".12"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="800" height="520" fill="url(#stack-wall)" />
        <path d="M0 0H800V33H0" fill="#8c7d6d" opacity=".35" />
        <path
          d="M45 35H195V218H45Z"
          fill="#eee2c4"
          stroke="#ac9e80"
          strokeWidth="8"
        />
        <path d="M120 40V214M49 127H190" stroke="#c4b58f" strokeWidth="7" />
        <path d="M48 213L77 166L100 184L140 150L194 200V216" fill="#9faa88" />
        <g opacity=".6">
          <rect x="660" y="85" width="62" height="98" rx="12" fill="#c5a095" />
          <rect x="656" y="78" width="70" height="17" rx="4" fill="#8c796b" />
          <rect x="674" y="118" width="34" height="29" rx="4" fill="#eee1bd" />
          <path d="M638 185H745" stroke="#9e8872" strokeWidth="9" />
        </g>
        <rect y="340" width="800" height="180" fill="url(#stack-wood)" />
        <rect y="340" width="800" height="180" fill="url(#stack-grain)" />
        <path d="M0 352H800" stroke="#eed0a2" strokeWidth="4" />
        <ellipse
          cx="400"
          cy="424"
          rx="247"
          ry="34"
          fill="#765d4c"
          opacity=".15"
        />
        <path
          d="M169 393Q190 432 400 436Q604 431 631 393"
          fill="#c4c4b5"
          stroke="#8b9c94"
          strokeWidth="3"
        />
        <ellipse
          cx="400"
          cy="391"
          rx="231"
          ry="27"
          fill="#f8f0d7"
          stroke="#a9b3a3"
          strokeWidth="3"
        />
        <ellipse
          cx="400"
          cy="392"
          rx="207"
          ry="18"
          fill="none"
          stroke="#d7d9bf"
          strokeWidth="2"
        />
        {!s.pieces.length && (
          <text
            x="400"
            y="395"
            textAnchor="middle"
            fill="#b3aa8c"
            fontSize="11"
            fontFamily="serif"
          >
            a little room for something lovely
          </text>
        )}
        {s.pieces
          .filter((p) => p.id !== drag?.sourceId)
          .map((p) => (
            <g
              key={p.id}
              data-piece-id={p.id}
              data-ingredient-id={p.ingredientId}
              transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}
              opacity={p.status === "lost" ? 0.45 : 1}
            >
              <IngredientShape ingredient={ingredientById(p.ingredientId)!} />
            </g>
          ))}
        {selected &&
          preview &&
          !s.served &&
          !moving &&
          s.pieces.length < 12 && (
            <g
              pointerEvents="none"
              transform={`translate(${preview.x} ${preview.y})`}
              opacity=".5"
            >
              {selected.contours.map((points, i) => (
                <polygon
                  key={i}
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#fff3cb"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              ))}
            </g>
          )}
        <text
          x="28"
          y="493"
          fill="#f0d2aa"
          fontSize="9"
          fontFamily="sans-serif"
        >
          THE CRUMB & CAULDRON
        </text>
        <text
          x="770"
          y="493"
          fill="#f0d2aa"
          fontSize="9"
          textAnchor="end"
          fontFamily="sans-serif"
        >
          {spilled
            ? `${spilled} piece${spilled === 1 ? "" : "s"} took a little tumble`
            : "Slow hands. Happy pastries."}
        </text>
      </svg>
      {!s.served && (
        <button
          className="stack-drop-surface"
          aria-label="Place selected ingredient on the plate"
          disabled={s.served || (moving && !drag)}
          onPointerDown={(e) => {
            const pos = point(e.clientX, e.clientY),
              hit = hitAt(pos.x, pos.y);
            if (hit) {
              if (canLiftPiece(hit, s.pieces))
                beginDrag(e, hit.ingredientId, hit.id);
            } else if (selected) beginDrag(e, selected.id);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "touch" || moving || !selected)
              return;
            aim(point(e.clientX, e.clientY).x);
          }}
          onClick={(e) => {
            if (consumeClick()) return;
            const pos = point(e.clientX, e.clientY);
            if (e.detail && hitAt(pos.x, pos.y)) return;
            drop(e.detail ? pos.x : s.aim);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              aim(s.aim + (e.key === "ArrowLeft" ? -16 : 16));
            }
          }}
        >
          <span className="sr-only">
            Move with left and right arrow keys; Enter or Space places your
            selected ingredient just above the stack. Drag exposed pieces to
            reposition them.
          </span>
        </button>
      )}
      <div className="board-status" aria-live="polite">
        {s.served
          ? "✦ Ready to share"
          : moving
            ? drag
              ? "Release over the plate to place · Escape to cancel"
              : "Settling into place…"
            : s.pieces.length >= 12
              ? "Tray full · undo a piece or serve"
              : selected
                ? `Holding ${selected.name} · drag to place, or use the placement controls`
                : "Choose something from the tray above"}
      </div>
    </div>
  );
}
