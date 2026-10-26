import { useRef, useState } from "react";
import {
  Coins,
  Star,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  gameNames,
  nextPastry,
  pastryScore,
  recipeFor,
  type PastrySession,
  type RecipeId,
} from "./pastries/rules";
import { usePastry } from "./pastries/usePastry";
import { ResultPastry, useKitchenSound } from "./pastries/Presentation";
import { RhythmGame } from "./pastries/RhythmGame";
import { DoughPuzzle } from "./pastries/DoughPuzzle";
import { MemoryGame } from "./pastries/MemoryGame";
import { SpiralGame } from "./pastries/SpiralGame";
import "./baking/baking.css";
import "./pastries/pastries.css";
interface Props {
  orderIds: RecipeId[];
  seed: number;
  draft: PastrySession | null;
  onDraft: (s: PastrySession) => void;
  onDone: (score: number, count: number) => void;
  bonus?: number;
}
const descriptions: Record<
  RecipeId,
  { title: string; text: string; hint: string; start: string }
> = {
  ember: {
    title: "Give your bun a heartbeat.",
    text: "Knead as the ring meets the dough. Six soft beats make one warm bun.",
    hint: "Tap Knead or press Space. Sound and visual cues follow the same beat.",
    start: "Start kneading",
  },
  moon: {
    title: "A little puzzle, folded by hand.",
    text: "Three dough pieces belong in three outlines. Rotate them until the pointed ends line up.",
    hint: "Drag pieces, or choose a piece and tap a numbered space. Undo is free.",
    start: "Start dough puzzle",
  },
  ghost: {
    title: "A recipe you can almost hear.",
    text: "Four bowls will glow, one at a time. Remember their order to fill your tart.",
    hint: "Watch, then tap the bowls. Replay the recipe whenever you like.",
    start: "Watch recipe",
  },
  cinnamon: {
    title: "A spiral worth taking your time over.",
    text: "Follow the glowing tip with your icing bag. Leave a creamy trail around the roll.",
    hint: "Drag along the spiral. Lift to reposition, or use Pipe next section and the right arrow.",
    start: "Start icing",
  },
};
export function Baking({
  orderIds,
  seed,
  draft,
  onDraft,
  onDone,
  bonus = 0,
}: Props) {
  const {
    session: s,
    current,
    commit,
    running,
    setRunning,
    onFrame,
  } = usePastry(orderIds, seed, draft, onDraft);
  const [watchToken, setWatchToken] = useState(0);
  const paid = useRef(false);
  const touchTap = useRef<{
      button: HTMLButtonElement;
      x: number;
      y: number;
      id: number;
    } | null>(null),
    lastTouch = useRef(-Infinity);
  const audio = useKitchenSound();
  const id = s.orderIds[s.part],
    r = recipeFor(id),
    intro = descriptions[id],
    score = pastryScore(s);
  const total = s.scores.reduce((a, b) => a + b, 0) + score;
  const last = s.part === s.orderIds.length - 1;
  const finish = () => {
    setRunning(false);
    audio.tone(660, 0.16);
    commit({ ...current.current, stage: "result" });
  };
  const start = () => {
    audio.tone(260, 0.08);
    commit({ ...s, stage: "play" });
    if (id === "ember") setRunning(true);
    if (id === "ghost") setWatchToken((n) => n + 1);
  };
  const resultSummary =
    id === "ember"
      ? `${s.beats.filter((n) => n > 0).length} / 6 beats kneaded`
      : id === "moon"
        ? `${score} / 3 folds aligned`
        : id === "ghost"
          ? `Four layers remembered · ${s.mistakes} little mix-ups`
          : `${Math.round((s.traced / 80) * 100)}% of the spiral iced`;
  return (
    <div
      className={`baking-game signature-game game-${id} game-${s.stage}`}
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
          <span className="eyebrow">
            {s.orderIds.length > 1
              ? `BAKERY SAMPLER · PASTRY ${s.part + 1} OF ${s.orderIds.length}`
              : `${r.customer}’S LITTLE WISH`}
          </span>
          <h2>{r.name}</h2>
          <p>{gameNames[id]}</p>
        </div>
        <div className="signature-preferences">
          <button
            aria-label={
              audio.enabled ? "Mute kitchen sounds" : "Enable kitchen sounds"
            }
            aria-pressed={audio.enabled}
            onClick={audio.toggle}
          >
            {audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <label>
            <input
              type="checkbox"
              checked={s.assisted}
              disabled={running}
              onChange={(e) => commit({ ...s, assisted: e.target.checked })}
            />
            Helping hand
          </label>
        </div>
      </header>
      <div className="baking-workspace">
        <section className="baking-station" aria-label={gameNames[id]}>
          {s.stage === "intro" ? (
            <div className="pastry-primer">
              <span className="signature-emblem" aria-hidden="true">
                {id === "ember"
                  ? "♥"
                  : id === "moon"
                    ? "☾"
                    : id === "ghost"
                      ? "✦"
                      : "◉"}
              </span>
              <h3>{intro.title}</h3>
              <p>{intro.text}</p>
              <div className="primer-controls">{intro.hint}</div>
              <button className="primary signature-primary" onClick={start}>
                {intro.start}
                <ArrowRight size={17} />
              </button>
              <small>
                No ingredients lost. Every pastry earns a little something.
              </small>
            </div>
          ) : s.stage === "result" ? (
            <>
              <div className="signature-direction">
                <span className="eyebrow">FRESH FROM THE HEARTH</span>
                <h3>
                  {score === 3
                    ? "A little bakery magic."
                    : score === 2
                      ? "Made with care."
                      : "A perfectly personal pastry."}
                </h3>
                <p>
                  {s.legacyScore !== undefined
                    ? "Your earlier creation is ready to collect."
                    : resultSummary}
                </p>
              </div>
              <ResultPastry session={s} />
              <div className="mobile-quality">
                <span>{score} / 3 quality stars</span>
                <strong>
                  {last
                    ? 12 * s.orderIds.length +
                      total * 4 +
                      bonus * s.orderIds.length
                    : "One pastry packed"}
                  {last ? " coins" : ""}
                </strong>
              </div>
              <button
                className="primary signature-primary result-action"
                disabled={paid.current}
                onClick={() => {
                  if (!last) {
                    commit(nextPastry(s));
                    return;
                  }
                  if (paid.current) return;
                  paid.current = true;
                  onDone(total, s.orderIds.length);
                }}
              >
                {last
                  ? "Collect payment"
                  : `Pack pastry & make ${recipeFor(s.orderIds[s.part + 1]).name}`}
                <ArrowRight size={17} />
              </button>
            </>
          ) : id === "ember" ? (
            <RhythmGame
              session={s}
              current={current}
              onFrame={onFrame}
              commit={commit}
              running={running}
              setRunning={setRunning}
              tone={audio.tone}
            />
          ) : id === "moon" ? (
            <DoughPuzzle session={s} commit={commit} finish={finish} />
          ) : id === "ghost" ? (
            <MemoryGame
              session={s}
              commit={commit}
              tone={audio.tone}
              watchToken={watchToken}
            />
          ) : (
            <SpiralGame
              session={s}
              current={current}
              commit={commit}
              finish={finish}
            />
          )}
        </section>
        <aside className="baking-ticket">
          <span className="ticket-pin" aria-hidden="true">
            ✦
          </span>
          <span className="eyebrow">THE CRUMB & CAULDRON</span>
          <h3>{s.stage === "result" ? "Order up!" : "Made just for you"}</h3>
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
          {s.orderIds.length > 1 && (
            <ol className="sampler-list" aria-label="Sampler contents">
              {s.orderIds.map((recipe, i) => (
                <li key={recipe} className={i < s.part ? "packed" : ""}>
                  {i < s.part ? "✓ " : ""}
                  {recipeFor(recipe).name}
                  {i === s.part ? " · making now" : ""}
                </li>
              ))}
            </ol>
          )}
          {s.stage === "result" ? (
            <>
              <div
                className="baking-stars"
                aria-label={`${score} of 3 quality stars`}
              >
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    size={26}
                    fill={score > i ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <blockquote>
                “
                {score === 3
                  ? "Exactly what I was hoping for. Thank you, Rowan!"
                  : score === 2
                    ? "Still warm, and made just for me? Lovely."
                    : "A little rustic. I can tell you put your heart into it."}
                ”<cite>— {r.customer}</cite>
              </blockquote>
              <div className="baking-payment">
                <Coins size={18} />
                <strong>
                  {last
                    ? 12 * s.orderIds.length +
                      total * 4 +
                      bonus * s.orderIds.length
                    : 12 + score * 4 + bonus}
                </strong>
                <span>{last ? "coins earned" : "coins in your sampler"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="ticket-tip">
                <Sparkles size={19} />
                <p>
                  {s.assisted
                    ? {
                        ember:
                          "A wider timing window, with the same possible rewards.",
                        moon: "Piece names and rotation hints help you match the outlines.",
                        ghost:
                          "Keep the recipe visible while you choose the bowls.",
                        cinnamon:
                          "A broader guide makes icing easier to follow.",
                      }[id]
                    : intro.hint}
                </p>
              </div>
              <small className="baking-save-note">
                Your progress is saved.
                <br />
                {id === "ember"
                  ? "Leaving the kitchen pauses the beat."
                  : "Take all the time you need."}
              </small>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
