import { evaluatePastry } from "./bakingRules";
import { useEffect, useState } from "react";
import { recipes } from "../game/data";
import { Pastry } from "../components/Art";
export function Baking({
  index,
  onDone,
}: {
  index: number;
  onDone: (score: number) => void;
}) {
  const r = recipes[index % 3];
  const [stage, S] = useState(0);
  const [selected, Q] = useState(["", "", ""]);
  const [heat, H] = useState(0);
  const [running, R] = useState(false);
  const [baked, B] = useState(false);
  const [marks, M] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => H((h) => (h + 1) % 101), 45);
    return () => clearInterval(id);
  }, [running]);
  const score = evaluatePastry(r, selected, heat, marks);
  return (
    <>
      <div className="steps">
        {["Assemble", "Bake", "Decorate"].map((s, i) => (
          <span className={stage === i ? "current" : ""} key={s}>
            0{i + 1} · {s}
          </span>
        ))}
      </div>
      <div className="bake-layout">
        <div className="pastry-preview">
          <Pastry variant={r.base} color={r.color} stars={marks} />
          <span>{r.name}</span>
        </div>
        <div className="bake-controls">
          {stage === 0 ? (
            <>
              <h3>A little of this, a little magic.</h3>
              {["Pastry base", "Filling", "Finishing touch"].map((label, i) => (
                <fieldset key={label}>
                  <legend>{label}</legend>
                  {recipes.map((rec) => (
                    <button
                      className={
                        selected[i] === [rec.base, rec.filling, rec.topping][i]
                          ? "selected ingredient"
                          : "ingredient"
                      }
                      key={rec.id}
                      onClick={() =>
                        Q((s) =>
                          s.map((v, j) =>
                            j === i
                              ? [rec.base, rec.filling, rec.topping][i]
                              : v,
                          ),
                        )
                      }
                    >
                      {[rec.base, rec.filling, rec.topping][i]}
                    </button>
                  ))}
                </fieldset>
              ))}
              <button
                className="primary"
                disabled={selected.some((s) => !s)}
                onClick={() => S(1)}
              >
                Into the oven →
              </button>
            </>
          ) : stage === 1 ? (
            <>
              <h3>Find the cozy spot.</h3>
              <p>
                Start the oven, then stop the warmth in the green zone. Take
                your time; you can try again.
              </p>
              <div className="heat">
                <div className="sweet-zone" />
                <i style={{ left: `${heat}%` }} />
              </div>
              <p className="muted">
                Cool <span className="right">A little too toasty</span>
              </p>
              <button
                className="primary"
                onClick={() => {
                  if (running) {
                    R(false);
                    B(true);
                  } else {
                    R(true);
                    B(false);
                  }
                }}
              >
                {running ? "Take it out" : "Warm the oven"}
              </button>
              {baked && (
                <button onClick={() => S(2)}>Time to decorate →</button>
              )}
            </>
          ) : (
            <>
              <h3>Make it yours.</h3>
              <p>Sprinkle at least three little touches on your pastry.</p>
              <button
                className="decoration"
                onClick={() => M((n) => Math.min(8, n + 1))}
              >
                ✦ Add {r.topping.toLowerCase()} · {marks}/8
              </button>
              <button className="primary" onClick={() => S(3)}>
                Serve with love →
              </button>
            </>
          )}
        </div>
      </div>
      {stage === 3 && (
        <div className="result">
          <span className="eyebrow">FRESH FROM YOUR OVEN</span>
          <h2>{["Homemade", "Homemade", "Great", "Perfect"][score]}!</h2>
          <p>Even a slightly wonky pastry can make someone’s day.</p>
          <button className="primary" onClick={() => onDone(score)}>
            Collect payment →
          </button>
        </div>
      )}
    </>
  );
}
