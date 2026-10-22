import { BakeryDashboard } from "./components/BakeryDashboard";
import { visitLocation, discover } from "./game/exploration";
import {
  Relationships,
  QuestJournal,
  RecipeBook,
  BakeryUpgrades,
  TownMap,
} from "./components/GameViews";
import { useState, useEffect, type ReactNode } from "react";
import {
  BookOpen,
  Heart,
  Map,
  House,
  Settings,
  Coins,
  Sparkles,
  Sun,
  ChevronRight,
  Check,
  ShoppingBag,
  Moon,
  ArrowUpRight,
  Save,
  X,
  Flame,
  Leaf,
} from "lucide-react";
import { useGame } from "./game/store";
import {
  characters,
  recipes,
  quests,
  locations,
  upgrades,
  type Npc,
  type PuzzleId,
} from "./game/data";
import {
  bake,
  upgrade,
  sleep,
  spendTime,
  relationshipLevel,
  eligible,
  scheduleEnding,
} from "./game/rules";
import { BakeryArt, Pastry, Portrait } from "./components/Art";
import { getDialogue } from "./game/dialogue";
import { Baking } from "./minigames/Baking";
import { Puzzle } from "./minigames/Puzzle";
type Tab = "bakery" | "town" | "journal" | "people" | "recipes";
type Modal = "baking" | "settings" | "intro" | Npc | null;
function Panel({
  children,
  close,
  wide = false,
}: {
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  return (
    <div className="overlay" onClick={close}>
      <section
        className={"modal " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Bakery activity"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <button
          className="close icon-button"
          aria-label="Close dialog"
          autoFocus
          onClick={close}
        >
          <X size={20} />
        </button>
        {children}
      </section>
    </div>
  );
}
export default function App() {
  const { game: g, update, newGame, save, load, notice } = useGame();
  const [tab, T] = useState<Tab>("bakery");
  const [modal, M] = useState<Modal>(null);
  const [puzzle, P] = useState<PuzzleId | null>(null);
  const [visit, V] = useState<number | null>(null);
  const [toast, N] = useState("");
  const [menu, U] = useState(!g.started);
  const [endingRead, E] = useState(!!g.ending);
  const recipe = recipes[((g.day - 1) * 2 + g.orders) % 3];
  const npcNames = Object.keys(characters) as Npc[];
  const notify = (s: string) => {
    N(s);
    setTimeout(() => N(""), 4000);
  };
  const finishVisit = () => {
    V(null);
    update((s) => ({ ...s, phase: "evening" }));
    T("bakery");
  };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const timer = requestAnimationFrame(() => {
      const overlay = document.querySelector(".overlay:last-of-type");
      if (overlay && !overlay.contains(document.activeElement))
        (overlay.querySelector("button") as HTMLElement | null)?.focus();
    });
    const trap = (e: KeyboardEvent) => {
      const overlays = document.querySelectorAll<HTMLElement>(".overlay");
      const overlay = overlays[overlays.length - 1];
      if (!overlay || e.key !== "Tab") return;
      const targets = [
        ...overlay.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,summary,[tabindex="0"]',
        ),
      ];
      const first = targets[0],
        last = targets[targets.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !overlay.contains(document.activeElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !overlay.contains(document.activeElement))
      ) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(timer);
      document.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [menu, modal, visit, puzzle, g.phase]);
  const nav = [
    { id: "bakery" as Tab, name: "The bakery", icon: House },
    { id: "town" as Tab, name: "Around town", icon: Map },
    { id: "journal" as Tab, name: "Quest journal", icon: BookOpen },
    { id: "people" as Tab, name: "Relationships", icon: Heart },
    { id: "recipes" as Tab, name: "Recipe book", icon: ShoppingBag },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            T("bakery");
          }}
        >
          <div className="brand-emblem">
            ☾<span>✦</span>
          </div>
          <span>
            NETHERWORLD<small>BAKERY</small>
          </span>
        </a>
        <div className="sidebar-rule" />
        <span className="eyebrow nav-label">YOUR LITTLE CORNER</span>
        <nav>
          {nav.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? "nav-item active" : "nav-item"}
              onClick={() => T(id)}
            >
              <Icon size={19} />
              {name}
              {id === "journal" && g.flags.length < 2 && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="bakery-level">
            <div className="level-icon">
              <Flame size={22} />
            </div>
            <div>
              <span>Your bakery</span>
              <strong>
                Level {g.level} <span>/ 5</span>
              </strong>
            </div>
            <span className="tiny-star">✦</span>
            <div className="level-bar">
              <i style={{ width: `${g.level * 20}%` }} />
            </div>
            <small>
              {g.level === 5
                ? "A little dream, fully risen."
                : "Small beginnings. Sweet possibilities."}
            </small>
          </div>
          <button className="nav-item" onClick={() => M("settings")}>
            <Settings size={18} /> Settings & save
          </button>
          <div className="footer-mark">
            MADE WITH A LITTLE MAGIC <Sparkles size={12} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="day-info">
            <span className="sun-icon">
              <Sun size={19} />
            </span>
            <strong>Day {g.day}</strong>
            <span className="dot">·</span>
            <span>
              {g.phase === "work"
                ? "A fresh start"
                : g.phase === "free"
                  ? "Yours to wander"
                  : g.phase === "evening"
                    ? "A quiet evening"
                    : "A new chapter"}
            </span>
          </div>
          <div className="currencies">
            <span title="Bakery coins">
              <Coins size={18} />
              <b>{g.money}</b>
              <small>coins</small>
            </span>
            <span title="Puzzle hint coins">
              <Sparkles size={17} />
              <b>{g.coins}</b>
              <small>hint coins</small>
            </span>
            <button
              className="icon-button mobile-settings"
              aria-label="Settings and save"
              onClick={() => M("settings")}
            >
              <Settings size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Save game"
              onClick={() => {
                save();
                notify(useGame.getState().notice);
              }}
            >
              <Save size={18} />
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <span className="eyebrow">A LITTLE MAGIC. FRESHLY BAKED.</span>
              <h1>
                {tab === "bakery"
                  ? "Home is where the hearth is."
                  : tab === "town"
                    ? "A village full of little wonders."
                    : tab === "journal"
                      ? "Every crumb tells a story."
                      : tab === "people"
                        ? "Some warmth comes from company."
                        : "A pinch of this. A wish of that."}
              </h1>
              <p>
                {tab === "bakery"
                  ? "The oven’s warm, the village is waking. Let’s make someone’s day."
                  : tab === "town"
                    ? "Follow a rumor, find a friend, or see where the cobblestones take you."
                    : tab === "journal"
                      ? "Loose threads, curious whispers, and things worth finding."
                      : tab === "people"
                        ? "A few familiar faces in a very unfamiliar world."
                        : "Good things are meant to be shared."}
              </p>
            </div>
            <span className="season-pill">
              <Leaf size={13} /> Autumn, softly
            </span>
          </div>
          <div className="phase-track">
            {[
              {
                name: "Bakery work",
                label: "A little flour, a little love",
                icon: Sun,
                phase: "work",
              },
              {
                name: "Free time",
                label: "The village is yours",
                icon: Leaf,
                phase: "free",
              },
              {
                name: "Evening",
                label: "Rest, reflect, repeat",
                icon: Moon,
                phase: "evening",
              },
            ].map(({ name, label, icon: Icon, phase }, i) => (
              <div
                key={phase}
                className={
                  "phase-step " +
                  (g.phase === phase
                    ? "is-active"
                    : ["work", "free", "evening"].indexOf(g.phase) > i
                      ? "is-done"
                      : "")
                }
              >
                <span className="phase-number">
                  {["work", "free", "evening"].indexOf(g.phase) > i ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={17} />
                  )}
                </span>
                <div>
                  <strong>{name}</strong>
                  <small>{label}</small>
                </div>
                {i < 2 && <ChevronRight size={16} className="phase-arrow" />}
              </div>
            ))}
          </div>
          {tab === "bakery" && (
            <BakeryDashboard
              onTown={() => T("town")}
              onJournal={() => T("journal")}
              onPeople={() => T("people")}
              onBake={() => M("baking")}
              notify={notify}
            />
          )}
          {tab === "town" && (
            <TownMap
              onVisit={(i) => {
                V(i);
                update((s) => visitLocation(s, i));
              }}
            />
          )}
          {tab === "people" && <Relationships onTalk={(n) => M(n)} />}
          {tab === "journal" && <QuestJournal onTown={() => T("town")} />}
          {tab === "recipes" && <RecipeBook />}
          {tab === "bakery" && g.phase === "evening" && <BakeryUpgrades />}
          <footer className="page-footer">
            <span>THE CRUMB & CAULDRON</span>
            <span>
              A small life. A little magic. A story of your own. <span>✧</span>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Sparkles size={16} />
          {toast}
        </div>
      )}
      {menu && (
        <div className="overlay menu-overlay">
          <section className="main-menu">
            <div className="brand-emblem">
              ☾<span>✦</span>
            </div>
            <span className="eyebrow">WELCOME TO YOUR LITTLE AFTERLIFE</span>
            <h1>
              Netherworld
              <br />
              <em>Bakery</em>
            </h1>
            <p>
              A little flour. A little magic.
              <br />
              Someone worth coming home to.
            </p>
            <button
              className="primary full"
              onClick={() => {
                if (
                  g.started &&
                  !confirm(
                    "Start a new story? Your automatic save will be replaced.",
                  )
                )
                  return;
                newGame();
                U(false);
                M("intro");
                E(false);
              }}
            >
              Begin a new story <ChevronRight size={16} />
            </button>
            {g.started && (
              <button
                className="full"
                onClick={() => {
                  U(false);
                  E(false);
                }}
              >
                Continue your story
              </button>
            )}
            <button
              className="text-button"
              onClick={() => {
                if (load()) {
                  U(false);
                  E(false);
                } else notify("No saved story yet. Begin a new one.");
              }}
            >
              Load saved story
            </button>
            <small>A cozy narrative puzzle adventure</small>
          </section>
        </div>
      )}
      {modal && (
        <Panel wide={modal === "baking"} close={() => M(null)}>
          {modal === "intro" ? (
            <>
              <span className="eyebrow">CHAPTER ONE · A FRESH START</span>
              <h2>A man, a dream, and a slightly haunted oven.</h2>
              <p>
                You are Rowan, the newest baker in Bramblewick. You came to this
                curious village for a quieter life. The oven hums, the flour
                occasionally sneezes, and the men here are rather lovely.
              </p>
              <p>
                Serve two customers each morning, choose one afternoon
                adventure, then enjoy a quiet evening. There’s no clock to race.
              </p>
              <button className="primary" onClick={() => M(null)}>
                Tie on your apron →
              </button>
            </>
          ) : modal === "baking" ? (
            <Baking
              index={(g.day - 1) * 2 + g.orders}
              onDone={(score) => {
                const before = g.money;
                update((s) => bake(s, score));
                M(null);
                notify(
                  `A happy customer! +${useGame.getState().game.money - before} coins.`,
                );
              }}
            />
          ) : modal === "settings" ? (
            <>
              <span className="eyebrow">KEEP YOUR STORY SAFE</span>
              <h2>A quiet little pause.</h2>
              <p>
                Automatic saves follow every important action. Manual saves
                occupy a separate slot, so you can return to an earlier chapter.
              </p>
              <div className="settings-actions">
                <button
                  className="primary"
                  onClick={() => {
                    save();
                    notify(useGame.getState().notice);
                  }}
                >
                  <Save size={16} /> Save this chapter
                </button>
                <button
                  onClick={() => {
                    load();
                    M(null);
                    E(false);
                  }}
                >
                  Load saved chapter
                </button>
                <button
                  onClick={() => {
                    M(null);
                    U(true);
                  }}
                >
                  Return to main menu
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Reset automatic progress and begin a new story? Your manual save is kept.",
                      )
                    ) {
                      newGame();
                      M("intro");
                      T("bakery");
                      E(false);
                    }
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
                  <p>For testing progression without repeating days.</p>
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
          ) : (
            <>
              <Portrait who={modal} />
              <span className="eyebrow">
                A LITTLE TIME WITH {characters[modal].name.toUpperCase()}
              </span>
              <h2>{getDialogue(g, modal).title}</h2>
              <p>{getDialogue(g, modal).text}</p>
              <p>{getDialogue(g, modal).response}</p>
              <div className="dialogue-choices">
                <button
                  className="primary"
                  disabled={g.phase !== "free"}
                  onClick={() => {
                    update((s) =>
                      spendTime(
                        {
                          ...s,
                          flags: [
                            ...new Set([...s.flags, getDialogue(s, modal).id]),
                          ],
                        },
                        modal,
                        false,
                      ),
                    );
                    M(null);
                    notify("A shared afternoon. +2 affection.");
                  }}
                >
                  “I’m glad we’re friends.”
                </button>
                <button
                  disabled={g.phase !== "free"}
                  onClick={() => {
                    update((s) =>
                      spendTime(
                        {
                          ...s,
                          flags: [
                            ...new Set([...s.flags, getDialogue(s, modal).id]),
                          ],
                        },
                        modal,
                        true,
                      ),
                    );
                    M(null);
                    notify(
                      "“I hoped you felt that way, too.” +2 affection · romantic interest remembered.",
                    );
                  }}
                >
                  {relationshipLevel(g, modal) >= 4
                    ? "“May I kiss you?”"
                    : "“I’d like this to be a date.”"}{" "}
                  <Heart size={15} />
                </button>
              </div>
            </>
          )}
        </Panel>
      )}
      {visit !== null && (
        <Panel close={finishVisit}>
          <div className="visit-icon">{locations[visit].icon}</div>
          <span className="eyebrow">AN AFTERNOON IN BRAMBLEWICK</span>
          <h2>{locations[visit].name}</h2>
          <p>{locations[visit].description}</p>
          <p className="muted">
            Something glints in the corners. Take a closer look.
          </p>
          {locations[visit].objects.map((o, i) => {
            const key = visit + "-" + i;
            return (
              <button
                className="object-button"
                key={o}
                disabled={g.collected.includes(key)}
                onClick={() => {
                  update((s) => discover(s, key));
                  notify("A tiny discovery! +2 hint coins.");
                }}
              >
                {g.collected.includes(key) ? "✓ Examined" : "✧ Examine"} {o}
              </button>
            );
          })}
          <button
            className="primary full"
            onClick={() => P(locations[visit].puzzle as PuzzleId)}
          >
            {g.solved.includes(locations[visit].puzzle)
              ? "Revisit the solved mystery"
              : "Investigate the mystery"}{" "}
            <Sparkles size={16} />
          </button>
          <p className="muted">
            The village rewards curiosity. Your first visit also reveals a local
            rumor in your journal.
          </p>
          <button
            onClick={() => {
              const key = `gift-${g.day}`;
              if (!g.collected.includes(key)) {
                update((s) => discover(s, key, 1));
                notify("A neighbor shares a hint coin. Come back another day.");
              }
            }}
          >
            Ask a neighbor for a hint coin (once per day)
          </button>
          <button className="full" onClick={finishVisit}>
            Head home for the evening →
          </button>
        </Panel>
      )}
      {puzzle && (
        <Panel close={() => P(null)}>
          <Puzzle key={puzzle} id={puzzle} onClose={() => P(null)} />
        </Panel>
      )}
      {g.phase === "ending" && g.scheduled && !menu && (
        <div className="overlay">
          <section className="main-menu ending-menu">
            <Portrait who={g.scheduled} />
            <span className="eyebrow">
              {endingRead ? "THE END · FOR NOW" : "THE NEXT MORNING"}
            </span>
            <h1>
              {endingRead ? "A life, freshly baked." : "A table for two."}
            </h1>
            <p>
              {endingRead
                ? `You and ${characters[g.scheduled].name} keep the hearth alight. There are still mysteries, slightly burnt buns, and mornings worth waking for. But now, you face them together.`
                : `${characters[g.scheduled].name} waits at the bakery door. “You built something beautiful here, Rowan. Would there be room for one more?” He takes your hand. The bell rings, and a new chapter begins.`}
            </p>
            {!endingRead ? (
              <button
                className="primary"
                onClick={() => {
                  E(true);
                  update((s) => ({ ...s, ending: s.scheduled }));
                }}
              >
                “There’s always room for you.” ♡
              </button>
            ) : (
              <>
                <button className="primary" onClick={() => U(true)}>
                  Return to main menu
                </button>
                <button
                  onClick={() => {
                    if (load()) E(false);
                  }}
                >
                  Load an earlier save
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
