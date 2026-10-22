import { BellInput, DeductionInput, LanternInput } from "./PuzzleInputs";
import { useState } from "react";
import { puzzles, type PuzzleId } from "../game/data";
import { hint, solve } from "../game/rules";
import { useGame } from "../game/store";
export function Puzzle({ id, onClose }: { id: PuzzleId; onClose: () => void }) {
  const { game, update } = useGame();
  const p = puzzles[id];
  const [answer, A] = useState("");
  const [feedback, F] = useState("");
  const solved = game.solved.includes(id);
  return (
    <>
      <span className="eyebrow">
        A LITTLE MYSTERY · +20 COINS · +2 HINT COINS
      </span>
      <h2>{p.title}</h2>
      <p className="muted">{p.intro}</p>
      <p className="puzzle-clue">{p.description}</p>
      {!solved && (
        <>
          {id === "bells" ? (
            <BellInput answer={answer} onChange={A} />
          ) : id === "deduction" ? (
            <DeductionInput answer={answer} onChange={A} />
          ) : (
            <LanternInput answer={answer} onChange={A} />
          )}
          <button
            className="primary"
            onClick={() => {
              if (answer.trim() === p.answer) {
                update((s) => solve(s, id));
                F("A lovely bit of logic! The village thanks you.");
              } else F("Not quite. Every clue matters. You can try again.");
            }}
          >
            Check my answer →
          </button>
        </>
      )}
      {(solved || feedback) && (
        <p className={solved ? "success" : "feedback"}>
          {solved
            ? "✦ Solved! " +
              (feedback || "You have already collected this reward.")
            : feedback}
        </p>
      )}
      <div className="hint-box">
        {p.hints.slice(0, game.hints[id] ?? 0).map((h, i) => (
          <p key={h}>
            Hint {i + 1}: {h}
          </p>
        ))}
        <button
          disabled={solved || (game.hints[id] ?? 0) >= 3 || game.coins < 1}
          onClick={() => update((s) => hint(s, id))}
        >
          ✧ Reveal a hint · 1 hint coin ({game.coins} left)
        </button>
      </div>
      <button onClick={onClose}>
        {solved ? "Back to exploring" : "Leave puzzle for later"} →
      </button>
    </>
  );
}
