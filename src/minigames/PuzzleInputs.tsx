interface InputProps {
  answer: string;
  onChange: (value: string) => void;
}
export function LanternInput({ answer, onChange }: InputProps) {
  return (
    <label className="number-answer">
      Next lantern{" "}
      <input
        autoComplete="off"
        type="number"
        value={answer}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function DeductionInput({ answer, onChange }: InputProps) {
  return (
    <div>
      {["Ada", "Bram", "Cora"].map((name) => (
        <button
          className={answer === name ? "selected" : ""}
          key={name}
          onClick={() => onChange(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
export function BellInput({ answer, onChange }: InputProps) {
  const bells = answer ? answer.split(",") : [];
  return (
    <>
      <div className="bell-slots">
        {[0, 1, 2].map((i) => (
          <span key={i}>{bells[i] ?? "?"}</span>
        ))}
      </div>
      {["Bronze", "Gold", "Silver"].map((b) => (
        <button
          key={b}
          disabled={bells.includes(b)}
          onClick={() => onChange([...bells, b].join(","))}
        >
          ♧ {b}
        </button>
      ))}
      <button onClick={() => onChange("")}>Clear</button>
    </>
  );
}
