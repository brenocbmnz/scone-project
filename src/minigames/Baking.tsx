import { useIngredientDrag } from "./stacking/useIngredientDrag";
import { DragPreview } from "./stacking/DragPreview";
import { StackBoard } from "./stacking/StackBoard";
import "./stacking/stacking.css";
import { useId, useRef } from "react";
import {
  Check,
  Undo2,
  RotateCcw,
  Hand,
  ArrowDown,
  Star,
  Coins,
} from "lucide-react";
import { recipes } from "../game/data";
import {
  ingredients,
  ingredientById,
  requirementsFor,
  type Category,
} from "./stacking/ingredients";
import { IngredientIcon } from "./stacking/IngredientArt";
import {
  addPiece,
  freshSession,
  isMoving,
  scoreStack,
  type StackSession,
} from "./stacking/physics";
import { useStacking } from "./stacking/useStacking";
interface Props {
  index: number;
  draft: StackSession | null;
  onDraft: (s: StackSession) => void;
  onDone: (score: number) => void;
  bonus?: number;
}
const tabs: { id: Category; label: string; number: string }[] = [
  { id: "base", label: "Dough & pastry", number: "01" },
  { id: "filling", label: "Fillings & icing", number: "02" },
  { id: "topping", label: "Toppings", number: "03" },
];
export function Baking({ index, draft, onDraft, onDone, bonus = 0 }: Props) {
  const r = recipes[index % recipes.length];
  const { session: s, apply } = useStacking(r.id, draft, onDraft);
  const req = requirementsFor(r);
  const result = scoreStack(s.pieces, req);
  const moving = isMoving(s.pieces);
  const selected = s.selected ? ingredientById(s.selected) : null;
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const paid = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const drop = (x = s.aim) => {
    if (!selected) return;
    apply(addPiece(s, selected.id, x));
  };
  const aim = (x: number) =>
    apply({ ...s, aim: Math.round(Math.max(45, Math.min(755, x))) }, false);
  const { drag, begin, consumeClick } = useIngredientDrag({
    onSelect: (id) => apply({ ...s, selected: id }),
    onRelease: (item) => {
      const rect = boardRef.current
        ?.querySelector("svg")
        ?.getBoundingClientRect();
      if (
        !rect ||
        item.clientX < rect.left ||
        item.clientX > rect.right ||
        item.clientY < rect.top ||
        item.clientY > rect.bottom
      )
        return;
      const scale = rect.width / 800;
      const placed = addPiece(
        s,
        item.ingredientId,
        (item.clientX - rect.left) / scale,
        (item.clientY - rect.top) / scale,
        item.sourceId,
      );
      apply({ ...placed, selected: null });
    },
  });
  const busy = moving || !!drag;
  const spilled = s.pieces.filter((p) => p.status === "lost").length;
  return (
    <div
      className={
        "stacking-game " +
        (s.served ? "is-served" : "") +
        (drag ? " is-dragging" : "")
      }
    >
      <DragPreview drag={drag} boardRef={boardRef} session={s} />
      <header className="stacking-title">
        <div>
          <span className="eyebrow">
            A LITTLE BALANCE. A LITTLE BAKERY MAGIC.
          </span>
          <h2>{r.name}</h2>
          <p>
            {s.served
              ? "Your creation, just as you made it."
              : "Drag an ingredient onto the plate. Release it where you want it to rest."}
          </p>
        </div>
        <div className="stack-score" role="status" aria-label="Recipe score">
          <Star size={19} />
          <strong>
            {result.points}
            <small> / {result.total}</small>
          </strong>
          <span>recipe points</span>
        </div>
      </header>
      <div className="stack-layout">
        <div className="stack-play">
          <div
            className="mobile-stack-checklist"
            aria-label="Recipe at a glance"
          >
            {result.details.map((item) => (
              <span
                key={item.ingredientId}
                className={item.standing >= item.count ? "checked" : ""}
              >
                {item.standing >= item.count ? "✓" : "○"}{" "}
                {ingredientById(item.ingredientId)!.name}
              </span>
            ))}
          </div>
          <div
            className="ingredient-tabs"
            role="tablist"
            aria-label="Ingredient types"
          >
            {tabs.map((t, index) => (
              <button
                role="tab"
                key={t.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={`${uid}-${t.id}`}
                aria-controls={`${uid}-pantry`}
                aria-selected={s.category === t.id}
                tabIndex={s.category === t.id ? 0 : -1}
                disabled={!!drag}
                onClick={() => apply({ ...s, category: t.id })}
                onKeyDown={(e) => {
                  let next = index;
                  if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
                  else if (e.key === "ArrowLeft")
                    next = (index + tabs.length - 1) % tabs.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = tabs.length - 1;
                  else return;
                  e.preventDefault();
                  apply({ ...s, category: tabs[next].id });
                  tabRefs.current[next]?.focus();
                }}
              >
                <small>{t.number}</small>
                {t.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${uid}-pantry`}
            aria-labelledby={`${uid}-${s.category}`}
            className="ingredient-tray"
          >
            {ingredients
              .filter((i) => i.category === s.category)
              .map((i) => {
                const needed = req.some((r) => r.ingredientId === i.id);
                return (
                  <button
                    key={i.id}
                    aria-label={`Pick ${i.name}`}
                    aria-pressed={s.selected === i.id}
                    className={
                      "pantry-item " + (s.selected === i.id ? "picked" : "")
                    }
                    disabled={s.served || moving}
                    onPointerDown={(e) => begin(e, i.id)}
                    onClick={() => {
                      if (!consumeClick()) apply({ ...s, selected: i.id });
                    }}
                  >
                    <IngredientIcon ingredient={i} />
                    <strong>{i.name}</strong>
                    <small>{needed ? "On the recipe" : "A little extra"}</small>
                  </button>
                );
              })}
          </div>
          <StackBoard
            boardRef={boardRef}
            drag={drag}
            beginDrag={begin}
            consumeClick={consumeClick}
            session={s}
            selected={selected ?? null}
            moving={busy}
            spilled={spilled}
            aim={aim}
            drop={drop}
          />
          {!s.served && (
            <div className="stack-tools">
              <label>
                <span>Choose placement</span>
                <input
                  aria-label="Placement position"
                  type="range"
                  min="45"
                  max="755"
                  step="5"
                  value={s.aim}
                  disabled={busy}
                  onChange={(e) => aim(Number(e.target.value))}
                />
              </label>
              <button
                className="drop-piece"
                disabled={!selected || busy || s.pieces.length >= 12}
                onClick={() => drop()}
              >
                <ArrowDown size={15} />
                Place ingredient
              </button>
              <button
                aria-label="Undo last ingredient"
                disabled={!s.pieces.length || busy}
                onClick={() => apply({ ...s, pieces: s.pieces.slice(0, -1) })}
              >
                <Undo2 size={16} />
              </button>
              <button
                aria-label="Clear plate"
                disabled={!s.pieces.length || busy}
                onClick={() =>
                  apply({
                    ...freshSession(r.id),
                    category: s.category,
                    selected: s.selected,
                    aim: s.aim,
                  })
                }
              >
                <RotateCcw size={16} />
              </button>
            </div>
          )}
        </div>
        <aside className="stack-recipe">
          <span className="eyebrow">
            {r.customer.toUpperCase()}’S LITTLE WISH
          </span>
          <h3>
            {s.served
              ? ["Homemade", "Homemade", "Great", "Perfect"][
                  result.payoutScore
                ] + "!"
              : "A recipe for happiness"}
          </h3>
          <p className="stack-quote">“{r.quote}”</p>
          <ul className="stack-checklist">
            {result.details.map((item) => (
              <li
                key={item.ingredientId}
                className={item.standing >= item.count ? "complete" : ""}
              >
                <span className="recipe-check">
                  {item.standing >= item.count ? <Check size={13} /> : <span />}
                </span>
                <div>
                  <strong>{ingredientById(item.ingredientId)!.name}</strong>
                  <small>
                    {Math.min(item.standing, item.count)} / {item.count} on the
                    plate
                  </small>
                </div>
                <span>+{item.count}</span>
              </li>
            ))}
          </ul>
          {s.served ? (
            <>
              <p className="stack-verdict">
                {result.points === result.total
                  ? "Every little layer stayed. A lovely bit of balance."
                  : result.points === 0
                    ? "A wonderfully unconventional creation. There’s always another batch."
                    : "A little wonky, a little wonderful. The missing pieces will be easier next time."}
              </p>
              <div className="stack-payout">
                <Coins size={17} />
                {12 + result.payoutScore * 4 + bonus}
                <small>coins earned</small>
              </div>
              <button
                className="primary full"
                disabled={paid.current}
                onClick={() => {
                  if (paid.current) return;
                  paid.current = true;
                  onDone(result.payoutScore);
                }}
              >
                Collect payment →
              </button>
            </>
          ) : (
            <>
              <div className="stack-tip">
                <Hand size={17} />
                <p>
                  Drag from the tray, or pick an ingredient and use Place
                  ingredient. Upper layers can be picked up again.
                </p>
              </div>
              <p className="stack-rules">
                1 point for each requested ingredient still supported by the
                plate when you serve. Extras don’t add points.
              </p>
              <button
                className="primary full serve-stack"
                disabled={busy || !s.pieces.length}
                onClick={() => apply({ ...s, served: true })}
              >
                Serve my creation →
              </button>
              <small className="stack-pause">
                No timer. No rush. Your stack saves when you leave.
              </small>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
