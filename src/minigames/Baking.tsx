import { useId, useRef, useState, type PointerEvent } from "react";
import {
  ArrowRight,
  Check,
  Coins,
  Flame,
  Hand,
  Pause,
  RotateCcw,
  Sparkles,
  Star,
  Undo2,
} from "lucide-react";
import { recipes } from "../game/data";
import {
  cookingScore,
  coverage,
  finishZones,
  gestureProgress,
  onPastry,
  shapeGesture,
  type BakingSession,
  type Mark,
} from "./baking/session";
import { useBaking } from "./baking/useBaking";
import { PastryCanvas } from "./baking/PastryCanvas";
import "./baking/baking.css";
interface Props {
  index: number;
  draft: BakingSession | null;
  onDraft: (s: BakingSession) => void;
  onDone: (score: number) => void;
  bonus?: number;
}
const stages = ["Shape", "Bake", "Finish"];
export function Baking({ index, draft, onDraft, onDone, bonus = 0 }: Props) {
  const r = recipes[index % recipes.length];
  const {
    session: s,
    commit,
    running,
    start,
    pause,
    takeOut,
  } = useBaking(r.id, draft, onDraft);
  const [gesture, setGesture] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const pointer = useRef<number | null>(null);
  const drawing = useRef(false);
  const latest = useRef(s);
  latest.current = s;
  // Activate short touch taps on release, and suppress their delayed compatibility click.
  // Keeping this at the game boundary also prevents a delayed click hitting the next step.
  const touchTap = useRef<{
    button: HTMLButtonElement;
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const lastTouch = useRef(-Infinity);
  const paid = useRef(false);
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();
  const guide = shapeGesture(r.id, s.shaped);
  const decorated = coverage(s);
  const score = cookingScore(s);
  const step = ["shape", "bake", "finish", "result"].indexOf(s.stage);
  const completeShape = () => {
    const now = latest.current;
    if (now.shaped >= 3 || now.stage !== "shape") return;
    commit({ ...now, shaped: now.shaped + 1 });
    setFeedback(
      ["A lovely start.", "Looking good!", "Ready for the oven."][now.shaped],
    );
  };
  const point = (e: PointerEvent<SVGSVGElement | HTMLDivElement>): Mark => {
    const matrix = svg.current!.getScreenCTM()!;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };
  const paint = (p: Mark) => {
    const now = latest.current;
    if (
      !onPastry(r.id, p) ||
      now.marks.length >= 160 ||
      now.marks.some((m) => Math.hypot(m.x - p.x, m.y - p.y) < 15)
    )
      return;
    const next = { ...now, marks: [...now.marks, p] };
    latest.current = next;
    commit(next);
  };
  const begin = (e: PointerEvent<SVGSVGElement | HTMLDivElement>) => {
    if (
      e.button !== 0 ||
      pointer.current !== null ||
      !["shape", "finish"].includes(s.stage)
    )
      return;
    const p = point(e);
    if (
      s.stage === "shape" &&
      (s.shaped >= 3 ||
        Math.hypot(p.x - guide.from.x, p.y - guide.from.y) > 100)
    )
      return;
    pointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (s.stage === "finish") {
      drawing.current = true;
      paint(p);
    } else {
      setGesture(0);
      setFeedback("");
    }
  };
  const move = (e: PointerEvent<SVGSVGElement | HTMLDivElement>) => {
    if (pointer.current !== e.pointerId) return;
    const p = point(e);
    if (drawing.current) paint(p);
    else {
      const progress = gestureProgress(guide, p);
      setGesture(progress);
    }
  };
  const release = (
    e: PointerEvent<SVGSVGElement | HTMLDivElement>,
    cancel = false,
  ) => {
    if (pointer.current !== e.pointerId) return;
    if (!cancel && !drawing.current) {
      const progress = gestureProgress(guide, point(e));
      if (progress >= 0.72) completeShape();
      else
        setFeedback(
          "Start at the hand and follow the arrow. Or use the action button below.",
        );
    }
    pointer.current = null;
    drawing.current = false;
    setGesture(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const resultText =
    score === 3
      ? "A little bakery magic."
      : score === 2
        ? "Made with care."
        : "A perfectly personal pastry.";
  return (
    <div
      className={`baking-game baking-${s.stage}`}
      onPointerDown={(e) => {
        const button = (e.target as Element).closest<HTMLButtonElement>(
          "button",
        );
        if (e.pointerType === "touch" && button && !button.disabled)
          touchTap.current = {
            button,
            x: e.clientX,
            y: e.clientY,
            id: e.pointerId,
          };
      }}
      onPointerCancel={() => {
        touchTap.current = null;
      }}
      onPointerUp={(e) => {
        const tap = touchTap.current;
        touchTap.current = null;
        if (
          e.pointerType !== "touch" ||
          !tap ||
          tap.id !== e.pointerId ||
          tap.button !== (e.target as Element).closest("button") ||
          Math.hypot(tap.x - e.clientX, tap.y - e.clientY) > 14 ||
          tap.button.disabled
        )
          return;
        e.preventDefault();
        lastTouch.current = performance.now();
        tap.button.click();
      }}
      onClickCapture={(e) => {
        if (
          (e.target as Element).closest("button") &&
          e.detail > 0 &&
          performance.now() - lastTouch.current < 700
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <header className="baking-header">
        <div>
          <span className="eyebrow">{r.customer}’S ORDER · MADE BY YOU</span>
          <h2>{r.name}</h2>
          <p>“{r.quote}”</p>
        </div>
        <ol className="baking-steps" aria-label="Baking progress">
          {stages.map((name, i) => (
            <li
              key={name}
              aria-current={step === i ? "step" : undefined}
              className={step > i ? "done" : step === i ? "current" : ""}
            >
              <span>{step > i ? <Check size={14} /> : i + 1}</span>
              {name}
            </li>
          ))}
        </ol>
      </header>
      <div className="baking-workspace">
        <section
          className="baking-station"
          aria-label={`${s.stage === "result" ? "Finished pastry" : stages[step]} station`}
        >
          <div className="station-direction" key={s.stage}>
            <span className="eyebrow">
              {s.stage === "result"
                ? "FRESH FROM YOUR BAKERY"
                : `STEP ${step + 1} OF 3`}
            </span>
            <h3>
              {s.stage === "shape"
                ? s.shaped === 3
                  ? "Beautiful. Let’s bake it."
                  : guide.instruction
                : s.stage === "bake"
                  ? running
                    ? s.heat < 40
                      ? "Watch your pastry turn golden."
                      : s.heat <= 96
                        ? "Golden! Take it out when you’re ready."
                        : "A little toasted. Time to take it out."
                    : "Your oven waits for you."
                  : s.stage === "finish"
                    ? `Scatter ${r.topping.toLowerCase()} over your pastry.`
                    : resultText}
            </h3>
            <p>
              {s.stage === "shape"
                ? "Drag from the hand along the arrow, or use the action button."
                : s.stage === "bake"
                  ? "A generous golden window. Closing the kitchen pauses the oven."
                  : s.stage === "finish"
                    ? "Paint or tap the pastry. Cover any 3 of the 5 marked sections."
                    : "Your pastry, just as you made it."}
            </p>
          </div>
          <div
            className={`baking-board ${running ? "oven-on" : ""}`}
            onPointerDown={begin}
            onPointerMove={move}
            onPointerUp={(e) => release(e)}
            onPointerCancel={(e) => release(e, true)}
          >
            <svg
              ref={svg}
              viewBox="0 0 800 460"
              role="img"
              aria-label={
                s.stage === "shape"
                  ? "Dough shaping work surface"
                  : s.stage === "finish"
                    ? "Pastry decorating work surface"
                    : "Your handmade pastry"
              }
            >
              <defs>
                <pattern
                  id={`${id}-wood`}
                  width="200"
                  height="120"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    width="200"
                    height="120"
                    fill={s.stage === "bake" ? "#44333c" : "#b78360"}
                  />
                  <path
                    d="M0 0H200M0 118H200M0 45Q100 20 200 45M0 80Q90 110 200 80"
                    stroke={s.stage === "bake" ? "#65505a" : "#9a694f"}
                    fill="none"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>
              <rect
                width="800"
                height="460"
                rx="14"
                fill={`url(#${id}-wood)`}
              />
              {s.stage === "bake" ? (
                <>
                  <rect
                    x="105"
                    y="60"
                    width="590"
                    height="330"
                    rx="28"
                    fill="#30303a"
                    stroke="#91818a"
                    strokeWidth="10"
                  />
                  <path d="M110 375H690" stroke="#b3a3a1" strokeWidth="9" />
                </>
              ) : (
                <>
                  <ellipse
                    cx="400"
                    cy="250"
                    rx="300"
                    ry="180"
                    fill="#f1d8aa22"
                  />
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <circle
                      key={i}
                      cx={145 + ((i * 79) % 510)}
                      cy={90 + ((i * 61) % 290)}
                      r={3 + (i % 4)}
                      fill="#fff3cb"
                      opacity=".5"
                    />
                  ))}
                </>
              )}
              <PastryCanvas
                session={s}
                preparing={s.stage === "shape"}
                progress={gesture ?? 0}
              />
              {s.stage === "shape" && s.shaped < 3 && (
                <g className="shape-guide" pointerEvents="none">
                  <path
                    d={`M${guide.from.x} ${guide.from.y}L${guide.to.x} ${guide.to.y}`}
                    stroke="#fff7d9"
                    strokeWidth="7"
                    strokeDasharray="12 12"
                    opacity=".9"
                  />
                  <circle
                    cx={guide.to.x}
                    cy={guide.to.y}
                    r="21"
                    fill="#1e3440"
                    stroke="#c3e7d0"
                    strokeWidth="3"
                  />
                  <text
                    x={guide.to.x}
                    y={guide.to.y + 6}
                    textAnchor="middle"
                    fontSize="22"
                    fill="#c3e7d0"
                  >
                    ✦
                  </text>
                  <g
                    transform={`translate(${guide.from.x + (guide.to.x - guide.from.x) * (gesture ?? 0)} ${guide.from.y + (guide.to.y - guide.from.y) * (gesture ?? 0)})`}
                  >
                    <circle
                      r="30"
                      fill="#fff0d2"
                      stroke="#25323e"
                      strokeWidth="4"
                    />
                    <Hand
                      x="-15"
                      y="-15"
                      width="30"
                      height="30"
                      color="#25323e"
                    />
                  </g>
                </g>
              )}
              {s.stage === "bake" && running && (
                <g
                  className="bake-steam"
                  fill="none"
                  stroke="#ffe7b3"
                  strokeWidth="5"
                  opacity=".65"
                >
                  <path d="M340 115Q320 80 340 50M400 100Q380 70 400 35M460 115Q440 80 460 50" />
                </g>
              )}
            </svg>
            {s.stage === "finish" && (
              <div
                className="decoration-zones"
                aria-label="Decoration sections"
              >
                {finishZones(r.id).map((p, i) => {
                  const covered = s.marks.some(
                    (m) => Math.hypot(m.x - p.x, m.y - p.y) <= 58,
                  );
                  return (
                    <button
                      key={i}
                      className={covered ? "covered" : ""}
                      style={{ left: `${p.x / 8}%`, top: `${p.y / 4.6}%` }}
                      aria-label={`Decorate section ${i + 1}`}
                      aria-pressed={covered}
                      onClick={() => paint(p)}
                    >
                      {covered ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            )}
            {s.stage === "shape" && (
              <div
                className="shape-progress"
                aria-label={`${s.shaped} of 3 shaping actions complete`}
              >
                {[0, 1, 2].map((i) => (
                  <span key={i} className={s.shaped > i ? "complete" : ""}>
                    {s.shaped > i ? "✓" : i + 1}
                  </span>
                ))}
              </div>
            )}
            {s.stage === "bake" && (
              <div className="oven-label">
                <Flame size={15} />
                {s.heat === 0
                  ? "Ready to bake"
                  : s.heat < 40
                    ? "Still pale"
                    : s.heat <= 96
                      ? "Golden & ready"
                      : "A little toasted"}
              </div>
            )}
          </div>
          <div className="baking-controls">
            {s.stage === "shape" ? (
              <>
                {s.shaped < 3 ? (
                  <button
                    className="primary baking-main-action"
                    onClick={completeShape}
                  >
                    <Hand size={18} />
                    {guide.action}
                    <span>{s.shaped + 1}/3</span>
                  </button>
                ) : (
                  <button
                    className="primary baking-main-action"
                    onClick={() => commit({ ...s, stage: "bake" })}
                  >
                    Into the oven
                    <ArrowRight size={18} />
                  </button>
                )}
                <p role="status">
                  {feedback || "No rush. Make it with your own hands."}
                </p>
              </>
            ) : s.stage === "bake" ? (
              <>
                <div
                  className="bake-gauge"
                  role="meter"
                  aria-label="Baking progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(s.heat)}
                >
                  <span className="golden-window" />
                  <i style={{ left: `${s.heat}%` }} />
                </div>
                <div className="bake-gauge-labels">
                  <span>Pale</span>
                  <span>Golden</span>
                  <span>Toasted</span>
                </div>
                <div className="oven-actions">
                  {!running && s.heat < 100 ? (
                    <button className="primary" onClick={start}>
                      <Flame size={17} />
                      {s.heat === 0 ? "Start baking" : "Resume baking"}
                    </button>
                  ) : running ? (
                    <button onClick={pause}>
                      <Pause size={17} />
                      Pause oven
                    </button>
                  ) : null}
                  <button
                    className="primary"
                    disabled={s.heat === 0}
                    onClick={takeOut}
                  >
                    Take pastry out
                    <ArrowRight size={17} />
                  </button>
                </div>
                <label className="gentle-oven">
                  <input
                    type="checkbox"
                    checked={s.assisted}
                    disabled={running}
                    onChange={(e) =>
                      commit({ ...s, assisted: e.target.checked })
                    }
                  />
                  Gentle oven <span>takes it out golden automatically</span>
                </label>
              </>
            ) : s.stage === "finish" ? (
              <>
                <div className="finishing-tools">
                  <span role="status">
                    <Sparkles size={17} />
                    {Math.min(3, decorated)} / 3 sections decorated
                  </span>
                  <button
                    aria-label="Undo decoration"
                    disabled={!s.marks.length}
                    onClick={() =>
                      commit({ ...s, marks: s.marks.slice(0, -1) })
                    }
                  >
                    <Undo2 size={17} />
                  </button>
                  <button
                    aria-label="Clear decorations"
                    disabled={!s.marks.length}
                    onClick={() => commit({ ...s, marks: [] })}
                  >
                    <RotateCcw size={17} />
                  </button>
                </div>
                <button
                  className="primary baking-main-action"
                  onClick={() => commit({ ...s, stage: "result" })}
                >
                  Serve my pastry
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <button
                className="primary baking-main-action"
                disabled={paid.current}
                onClick={() => {
                  if (paid.current) return;
                  paid.current = true;
                  onDone(score);
                }}
              >
                Collect payment
                <Coins size={18} />
              </button>
            )}
          </div>
        </section>
        <aside className="baking-ticket">
          <span className="ticket-pin" aria-hidden="true">
            ✦
          </span>
          <span className="eyebrow">THE CRUMB & CAULDRON</span>
          <h3>{s.stage === "result" ? "Order up!" : "One little wish"}</h3>
          <ul className="ticket-ingredients">
            <li>
              <span>DOUGH</span>
              {r.base}
            </li>
            <li>
              <span>FILLING</span>
              {r.filling}
            </li>
            <li>
              <span>FINISH</span>
              {r.topping}
            </li>
          </ul>
          {s.stage === "result" ? (
            <>
              <div
                className="baking-stars"
                aria-label={`${score} of 3 quality stars`}
              >
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    size={27}
                    fill={score > i ? "currentColor" : "none"}
                  />
                ))}
              </div>
              {s.legacyScore === undefined ? (
                <ul className="bake-breakdown">
                  <li>
                    <Check size={14} />
                    Shaped by hand
                  </li>
                  <li>
                    {(s.bakeRating ?? 0) > 0 ? "✓" : "○"}{" "}
                    {s.bakeRating === 2
                      ? "Beautifully golden"
                      : s.bakeRating === 1
                        ? "A good bake"
                        : s.heat < 40
                          ? "A little pale — wait for golden next time"
                          : "A little toasted — take it out sooner"}
                  </li>
                  <li>
                    {decorated >= 3 ? "✓" : "○"}{" "}
                    {decorated >= 3
                      ? "Topping spread with care"
                      : "Try decorating 3 marked sections"}
                  </li>
                </ul>
              ) : (
                <p>Your previous creation is ready to collect.</p>
              )}
              <blockquote>
                “
                {score === 3
                  ? `Exactly what I was hoping for. Thank you, Rowan!`
                  : score === 2
                    ? "Still warm, and made just for me? Lovely."
                    : "A little rustic. I can tell you put your heart into it."}
                ”<cite>— {r.customer}</cite>
              </blockquote>
              <div className="baking-payment">
                <Coins size={20} />
                <strong>{12 + score * 4 + bonus}</strong>
                <span>coins earned</span>
              </div>
            </>
          ) : (
            <>
              <div className="ticket-tip">
                <Hand size={20} />
                <p>
                  {s.stage === "shape"
                    ? "One gesture at a time. The action button works just as well as dragging."
                    : s.stage === "bake"
                      ? "Take it out in the golden zone. Use the gentle oven if you prefer relaxed baking."
                      : "Your topping is ready. Follow the marks or make your own pattern."}
                </p>
              </div>
              <small className="baking-save-note">
                Your progress is saved.
                <br />
                Leave the kitchen whenever you like.
              </small>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
