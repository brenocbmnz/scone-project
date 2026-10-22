import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
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
export function DialogueBox({
  speaker,
  text,
  caption,
  choices,
  children,
}: Props) {
  return (
    <section className="dialogue-dock" aria-label="Story and actions">
      <div className="speaker-plaque">
        <span>✦</span>
        {speaker}
        <span>✦</span>
      </div>
      <div className="dialogue-inner">
        <div className="story-copy" key={speaker + text}>
          {caption && <span className="eyebrow">{caption}</span>}
          <p aria-live="polite" aria-atomic="true">
            {text}
          </p>
          {children}
        </div>
        <div
          className={
            "story-actions " + (choices.length > 4 ? "many-actions" : "")
          }
        >
          {choices.map((c, i) => (
            <button
              key={c.label}
              className={"story-choice " + (c.kind ?? "")}
              disabled={c.disabled}
              onClick={c.onSelect}
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
      <div className="dialogue-bottom">
        <span>
          THE CRUMB & CAULDRON <i>✧</i> A BRAMBLEWICK STORY
        </span>
        <span>Take your time. The story will wait.</span>
      </div>
    </section>
  );
}
