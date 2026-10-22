import { IngredientShape } from "./IngredientArt";
import { ingredientById, type Ingredient } from "./ingredients";
import { WORLD, onPlate, type StackSession } from "./physics";
interface Props {
  session: StackSession;
  selected: Ingredient | null;
  moving: boolean;
  spilled: number;
  aim: (x: number) => void;
  drop: (x?: number) => void;
}
export function StackBoard({
  session: s,
  selected,
  moving,
  spilled,
  aim,
  drop,
}: Props) {
  return (
    <div className="stack-board">
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
        {s.pieces.map((p) => (
          <g
            key={p.id}
            transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}
            opacity={p.status === "lost" ? 0.45 : 1}
          >
            <IngredientShape ingredient={ingredientById(p.ingredientId)!} />
          </g>
        ))}
        {selected && !s.served && !moving && s.pieces.length < 12 && (
          <g pointerEvents="none">
            <path
              d={`M${s.aim} 110V${Math.min(WORLD.plateY - 20, ...s.pieces.filter((p) => onPlate(p, s.pieces)).map((p) => p.y - ingredientById(p.ingredientId)!.height / 2 - 15))}`}
              stroke="#fff4cf"
              strokeWidth="2"
              strokeDasharray="5 7"
              opacity=".7"
            />
            <g transform={`translate(${s.aim} 72)`} opacity=".8">
              <IngredientShape ingredient={selected} />
            </g>
            <path
              d={`M${s.aim - 7} 115l7 8 7-8`}
              stroke="#746655"
              strokeWidth="2"
              fill="none"
            />
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
          aria-label="Drop selected ingredient onto the plate"
          disabled={!selected || moving || s.pieces.length >= 12}
          onPointerMove={(e) => {
            if (e.pointerType === "touch" || moving || !selected) return;
            const rect = e.currentTarget.getBoundingClientRect();
            aim(((e.clientX - rect.left) / rect.width) * WORLD.width);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            drop(
              e.detail
                ? ((e.clientX - rect.left) / rect.width) * WORLD.width
                : s.aim,
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              aim(s.aim + (e.key === "ArrowLeft" ? -16 : 16));
            }
          }}
        >
          <span className="sr-only">
            Move with left and right arrow keys; Enter or Space drops your
            selected ingredient.
          </span>
        </button>
      )}
      <div className="board-status" aria-live="polite">
        {s.served
          ? "✦ Ready to share"
          : moving
            ? "A little wobble…"
            : s.pieces.length >= 12
              ? "Tray full · undo a piece or serve"
              : selected
                ? `Holding ${selected.name} · click the worktop to drop`
                : "Choose something from the tray above"}
      </div>
    </div>
  );
}
