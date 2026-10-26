import { useEffect, useRef, useState, type ReactNode } from "react";
import { PastryCanvas } from "../baking/PastryCanvas";
import { freshBaking } from "../baking/session";
import { recipeFor, type PastrySession } from "./rules";
export function WorkBoard({
  children,
  label,
  ...events
}: {
  children: ReactNode;
  label: string;
  onPointerDown?: React.PointerEventHandler<SVGSVGElement>;
  onPointerMove?: React.PointerEventHandler<SVGSVGElement>;
  onPointerUp?: React.PointerEventHandler<SVGSVGElement>;
  onPointerCancel?: React.PointerEventHandler<SVGSVGElement>;
}) {
  return (
    <div className="work-board-frame">
      <svg
        className="signature-board"
        viewBox="0 0 800 460"
        role="img"
        aria-label={label}
        {...events}
      >
        <rect width="800" height="460" rx="16" fill="#b98460" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M0 ${40 + i * 90}Q250 ${10 + i * 90} 500 ${40 + i * 90}T800 ${40 + i * 90}`}
            stroke="#9e6d50"
            strokeWidth="3"
            fill="none"
          />
        ))}
        <ellipse cx="400" cy="250" rx="300" ry="175" fill="#ffedbb18" />
        {children}
      </svg>
    </div>
  );
}
export function ResultPastry({ session: s }: { session: PastrySession }) {
  const id = s.orderIds[s.part];
  const r = recipeFor(id);
  return (
    <WorkBoard label={`Your finished ${r.name}`}>
      <PastryCanvas
        session={{
          ...freshBaking(id),
          stage: "result",
          shaped: 3,
          heat: 70,
          bakeRating: 2,
          marks: [],
        }}
      />
      {id === "cinnamon" && s.marks.length > 0 && (
        <polyline
          points={s.marks.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke="#fff3d6"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {id === "ghost" &&
        s.answers.map((b, i) => (
          <circle
            key={i}
            cx={310 + i * 60}
            cy={220 + (i % 2) * 35}
            r="17"
            fill={["#b283cf", "#ffd4a5", "#dce7bf", "#eaa1b2"][b]}
            stroke="#fff0d4"
            strokeWidth="3"
          />
        ))}
    </WorkBoard>
  );
}
export function useKitchenSound() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem("bakery-minigame-sound") !== "off",
  );
  const context = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      void context.current?.close();
    },
    [],
  );
  const tone = (frequency = 440, duration = 0.12) => {
    if (!enabled) return;
    try {
      const audio = context.current ?? (context.current = new AudioContext());
      void audio.resume().catch(() => {});
      const osc = audio.createOscillator(),
        gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.075, audio.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + duration,
      );
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch {
      /* Visual cues remain available without audio. */
    }
  };
  return {
    enabled,
    tone,
    toggle: () =>
      setEnabled((value) => {
        localStorage.setItem("bakery-minigame-sound", value ? "off" : "on");
        return !value;
      }),
  };
}
