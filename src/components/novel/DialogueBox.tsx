import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, History, Zap } from "lucide-react";
import { GameOverlay } from "./GameOverlay";
export interface Choice {
  label: string;
  detail?: string;
  onSelect: () => void;
  disabled?: boolean;
  kind?: "primary" | "romance";
}
interface Props {
  speaker: string;
  text: string;
  caption?: string;
  choices: Choice[];
  children?: ReactNode;
}
function StoryLine({ text, instant }: { text: string; instant: boolean }) {
  const [count, setCount] = useState(0);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const complete = instant || reduced || count >= text.length;
  useEffect(() => {
    if (complete) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const next = Math.floor((now - start) / 14);
      setCount(next);
      if (next < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, instant, reduced, complete]);
  return (
    <button
      className="story-line"
      aria-label={
        complete ? `Dialogue text: ${text}` : `Reveal dialogue: ${text}`
      }
      data-revealing={!complete}
      onClick={() => setCount(text.length)}
    >
      <span className="line-layout" data-text={text}>
        <span className="line-reveal">
          {complete ? text : text.slice(0, count)}
          <span className="text-cursor">▸</span>
        </span>
      </span>
    </button>
  );
}
export function DialogueBox({
  speaker,
  text,
  caption,
  choices,
  children,
}: Props) {
  const [instant, setInstant] = useState(
    () => localStorage.getItem("bakery-instant-text") === "true",
  );
  const [history, setHistory] = useState(false);
  const [entries, setEntries] = useState<{ speaker: string; text: string }[]>(
    [],
  );
  useEffect(() => {
    setEntries((previous) =>
      previous.at(-1)?.text === text && previous.at(-1)?.speaker === speaker
        ? previous
        : [...previous.slice(-49), { speaker, text }],
    );
  }, [speaker, text]);
  return (
    <>
      <section
        className={
          "dialogue-dock " + (speaker === "Rowan" ? "thought-dialogue" : "")
        }
        aria-label="Story and actions"
      >
        <div className="speaker-plaque">
          <span>✦</span>
          {speaker}
          <span>✦</span>
        </div>
        <div className="dialogue-inner">
          <div className="story-copy" key={speaker + text}>
            {caption && (
              <span className="eyebrow">
                {speaker === "Rowan" ? "INNER THOUGHTS · " : ""}
                {caption}
              </span>
            )}
            <StoryLine text={text} instant={instant} />
            {children}
          </div>
          <div
            className={
              "story-actions " + (choices.length > 4 ? "many-actions" : "")
            }
            key={text}
          >
            {choices.map((c, i) => (
              <button
                key={c.label}
                className={"story-choice " + (c.kind ?? "")}
                disabled={c.disabled}
                onClick={c.onSelect}
                style={{ animationDelay: `${i * 24}ms` }}
              >
                <span className="choice-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{c.label}</strong>
                  {c.detail && <small>{c.detail}</small>}
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="dialogue-tools">
          <span>
            {choices.length === 1
              ? "YOUR STORY CONTINUES"
              : "WHAT WILL YOU DO?"}
          </span>
          <button onClick={() => setHistory(true)}>
            <History size={13} /> Log
          </button>
          <button
            aria-pressed={instant}
            onClick={() =>
              setInstant((value) => {
                localStorage.setItem("bakery-instant-text", String(!value));
                return !value;
              })
            }
          >
            <Zap size={13} />
            {instant ? "Instant text" : "Flowing text"}
          </button>
        </div>
      </section>
      {history && (
        <GameOverlay title="Conversation log" onClose={() => setHistory(false)}>
          <div className="conversation-log">
            {entries.map((entry, i) => (
              <article key={i}>
                <strong>{entry.speaker}</strong>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        </GameOverlay>
      )}
    </>
  );
}
