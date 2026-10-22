import { Save } from "lucide-react";
import { useGame } from "../../game/store";
export function SystemMenu({
  onLoad,
  onReset,
  onMenu,
  notify,
}: {
  onLoad: () => void;
  onReset: () => void;
  onMenu: () => void;
  notify: (s: string) => void;
}) {
  const { save, notice, update } = useGame();
  return (
    <>
      <h2>A quiet little pause.</h2>
      <p>
        Your story saves automatically. A manual save keeps a separate chapter
        you can return to—even after an ending.
      </p>
      <div className="settings-actions">
        <button
          className="primary"
          onClick={() => {
            save();
            notify(useGame.getState().notice);
          }}
        >
          <Save size={16} />
          Save this chapter
        </button>
        <button onClick={onLoad}>Load saved chapter</button>
        <button onClick={onMenu}>Return to main menu</button>
        <button
          onClick={() => {
            if (
              confirm(
                "Reset automatic progress and begin a new story? Your manual save is kept.",
              )
            )
              onReset();
          }}
        >
          Reset progress…
        </button>
      </div>
      <p className="muted" role="status">
        {notice}
      </p>
      {import.meta.env.DEV && (
        <details>
          <summary>Developer tools</summary>
          <p>Skip the repetition while testing.</p>
          <button
            onClick={() =>
              update((s) => ({
                ...s,
                money: s.money + 300,
                coins: s.coins + 10,
              }))
            }
          >
            Add 300 coins + 10 hints
          </button>
          <button
            onClick={() =>
              update((s) => ({
                ...s,
                phase: "evening",
                level: 5,
                scene: {
                  screen: "home",
                  room: true,
                  visit: null,
                  talk: null,
                  beat: 0,
                  intro: null,
                },
                flags: [...new Set([...s.flags, "bell", "lantern"])],
                affection: { orin: 8, lucien: 8 },
                romance: { orin: true, lucien: true },
                final: { orin: true, lucien: true },
              }))
            }
          >
            Unlock both prototype endings
          </button>
        </details>
      )}
    </>
  );
}
