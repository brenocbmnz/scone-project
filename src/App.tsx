import { BakeryRoom } from "./components/novel/BakeryRoom";
import {
  startWork,
  canLeaveBakery,
  canSleep,
  type RoomObject,
} from "./game/bakeryRoom";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Heart,
  ShoppingBag,
  Settings,
  Coins,
  Sparkles,
  Sun,
  Moon,
  Save,
  Maximize,
  Minimize,
  Flame,
  MapPin,
  VolumeX,
} from "lucide-react";
import { useGame } from "./game/store";
import {
  characters,
  recipes,
  locations,
  type Npc,
  type PuzzleId,
} from "./game/data";
import {
  bake,
  sleep,
  spendTime,
  relationshipLevel,
  eligible,
  scheduleEnding,
} from "./game/rules";
import { visitLocation, discover } from "./game/exploration";
import { getDialogue } from "./game/dialogue";
import {
  homeNarration,
  introduction,
  sceneNames,
  locationScenes,
  locationNarration,
  initialScene,
  type SceneId,
  type SceneProgress,
} from "./game/scenes";
import {
  QuestJournal,
  RecipeBook,
  Relationships,
  BakeryUpgrades,
} from "./components/GameViews";
import { SceneStage, type Actor } from "./components/novel/SceneStage";
import { DialogueBox, type Choice } from "./components/novel/DialogueBox";
import { GameOverlay } from "./components/novel/GameOverlay";
import { SystemMenu } from "./components/novel/SystemMenu";
import { Baking } from "./minigames/Baking";
import { Puzzle } from "./minigames/Puzzle";
type Overlay =
  "journal" | "recipes" | "people" | "settings" | "upgrades" | "baking" | null;
export default function App() {
  const { game: g, update, newGame, save, load } = useGame();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [puzzle, setPuzzle] = useState<PuzzleId | null>(null);
  const [menu, setMenu] = useState(!g.started);
  const [toast, setToast] = useState("");
  const [observation, setObservation] = useState<string | null>(null);
  const [isFullscreen, setFullscreen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const state = g.scene;
  const recipeIndex = (g.day - 1) * 2 + g.orders;
  const recipe = recipes[recipeIndex % recipes.length];
  const talk = state.talk;
  const visit = state.visit;
  const scene: SceneId =
    visit !== null
      ? locationScenes[visit]
      : talk && state.room
        ? "bakery"
        : talk === "orin"
          ? "tower"
          : talk === "lucien"
            ? "library"
            : state.screen === "village"
              ? "village"
              : "bakery";
  const roomVisible =
    scene === "bakery" &&
    state.intro === null &&
    !talk &&
    visit === null &&
    g.phase !== "ending" &&
    state.room;
  const actor: Actor | undefined =
    g.phase === "ending"
      ? (g.scheduled ?? undefined)
      : (talk ??
        (g.phase === "work" &&
        g.workStarted &&
        !state.room &&
        state.intro === null
          ? "customer"
          : undefined));
  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  };
  const changeScene = (patch: Partial<SceneProgress>) => {
    setObservation(null);
    update((s) => ({ ...s, scene: { ...s.scene, ...patch } }));
  };
  const goHome = () => {
    setObservation(null);
    update((s) => ({ ...s, scene: initialScene() }));
  };
  const start = () => {
    if (
      g.started &&
      !confirm("Start a new story? Your automatic save will be replaced.")
    )
      return;
    newGame();
    update((s) => ({ ...s, scene: { ...initialScene(), intro: 0 } }));
    setMenu(false);
    setOverlay(null);
    setObservation(null);
  };
  const loadChapter = () => {
    if (load()) {
      setMenu(false);
      setOverlay(null);
      setPuzzle(null);
      setObservation(null);
      notify("Welcome back, Rowan.");
    } else notify("There is no saved chapter yet.");
  };
  const finishTalk = (romantic: boolean) => {
    if (!talk) return;
    update((s) => ({
      ...spendTime(
        { ...s, flags: [...new Set([...s.flags, getDialogue(s, talk).id])] },
        talk,
        romantic,
      ),
      scene: initialScene(),
    }));
    setObservation(null);
    notify(
      romantic
        ? "A feeling, returned. +2 affection · romantic interest remembered."
        : "An afternoon well shared. +2 affection.",
    );
  };
  const meet = (npc: Npc) => {
    if (g.phase !== "free") {
      notify("The afternoon is yours after both customers have been served.");
      return;
    }
    setOverlay(null);
    changeScene({
      talk: npc,
      visit: null,
      beat: 0,
      room: state.screen === "home",
    });
  };
  const interactWithRoom = (object: RoomObject) => {
    setObservation(null);
    switch (object) {
      case "register":
        if (g.phase === "work") update(startWork);
        else
          notify(
            "The day’s orders are done. The till can rest until tomorrow.",
          );
        break;
      case "oven":
      case "workbench":
        if (g.phase === "work" && g.workStarted) setOverlay("baking");
        else if (object === "oven") setOverlay("upgrades");
        else setOverlay("recipes");
        break;
      case "recipes":
        setOverlay("recipes");
        break;
      case "door":
        if (canLeaveBakery(g)) changeScene({ screen: "village", room: false });
        else
          notify(
            g.phase === "work"
              ? "Serve today’s two customers before heading out."
              : "Your afternoon adventure is done. The village will be here tomorrow.",
          );
        break;
      case "bed":
        if (canSleep(g)) update(sleep);
        else
          notify(
            g.phase === "work"
              ? "A fresh day is waiting. Serve your customers before turning in."
              : "There is still an afternoon adventure to enjoy. Visit town or invite a friend first.",
          );
        break;
      case "orin":
      case "lucien":
        if (g.phase === "free") meet(object);
        else if (eligible(g, object)) {
          update((s) => scheduleEnding(s, object));
          notify(
            `A meeting with ${characters[object].name} is planned for tomorrow. Click the bed when ready.`,
          );
        } else
          notify("Your friend is busy tonight. Try again tomorrow afternoon.");
    }
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.current?.requestFullscreen();
    } catch {
      notify("Full screen is unavailable in this browser.");
    }
  };
  // Shortcuts only act on the visible story, never on overlay controls or text fields.
  const choices: Choice[] = [];
  let speaker = "Narrator",
    text = homeNarration(g).text,
    caption = "A little life in the Netherworld";
  if (state.intro !== null) {
    const beat = introduction[state.intro];
    speaker = beat.speaker;
    text = beat.text;
    caption = "Chapter one · A fresh start";
    choices.push({
      label: state.intro === 2 ? "Tie on your apron" : "Continue",
      kind: "primary",
      onSelect: () =>
        changeScene({ intro: state.intro === 2 ? null : state.intro! + 1 }),
    });
  } else if (g.phase === "ending" && g.scheduled) {
    speaker = g.ending ? "Narrator" : characters[g.scheduled].name;
    caption = g.ending ? "The end · for now" : "A table for two";
    text = g.ending
      ? `You and ${characters[g.scheduled].name} keep the hearth alight. There are still mysteries, slightly burnt buns, and mornings worth waking for. But now, you face them together.`
      : `${characters[g.scheduled].name} waits at the bakery door. “You built something beautiful here, Rowan. Would there be room for one more?” He takes your hand. The bell rings, and a new chapter begins.`;
    if (!g.ending)
      choices.push({
        label: "“There’s always room for you.” ♡",
        kind: "romance",
        onSelect: () => update((s) => ({ ...s, ending: s.scheduled })),
      });
    else
      choices.push(
        { label: "Return to main menu", onSelect: () => setMenu(true) },
        { label: "Load an earlier save", onSelect: loadChapter },
      );
  } else if (talk) {
    const event = getDialogue(g, talk);
    caption = event.title;
    speaker = state.beat === 0 ? characters[talk].name : "Narrator";
    text = state.beat === 0 ? event.text : event.response;
    if (state.beat === 0)
      choices.push(
        {
          label: "Continue",
          kind: "primary",
          onSelect: () => changeScene({ beat: 1 }),
        },
        { label: "“Another time, perhaps.”", onSelect: goHome },
      );
    else
      choices.push(
        {
          label: "“I’m glad we’re friends.”",
          onSelect: () => finishTalk(false),
        },
        {
          label:
            relationshipLevel(g, talk) >= 4
              ? "“May I kiss you?”"
              : "“I’d like this to be a date.”",
          kind: "romance",
          onSelect: () => finishTalk(true),
        },
      );
  } else if (visit !== null) {
    const location = locations[visit];
    caption = "An afternoon in Bramblewick";
    text = observation ?? locationNarration[visit];
    for (const [i, object] of location.objects.entries()) {
      const key = `${visit}-${i}`;
      choices.push({
        label: `${g.collected.includes(key) ? "Revisit" : "Examine"} ${object}`,
        detail: g.collected.includes(key)
          ? "Already searched"
          : "Something catches the light",
        onSelect: () => {
          if (!g.collected.includes(key)) {
            update((s) => discover(s, key));
            setObservation(
              `Behind the ${object.toLowerCase()}, you find two tiny silver coins. Someone has scratched a star into each one. A little help for the next mystery. (+2 hint coins)`,
            );
            notify("+2 hint coins");
          } else
            setObservation(
              "You have already looked here. Nothing new, but it is a lovely little corner of the world.",
            );
        },
      });
    }
    choices.push(
      {
        label: g.solved.includes(location.puzzle)
          ? "Revisit the solved mystery"
          : "Investigate the mystery",
        kind: "primary",
        onSelect: () => setPuzzle(location.puzzle as PuzzleId),
      },
      {
        label: "Ask a neighbor for a hint coin",
        detail: "Once per day",
        disabled: g.collected.includes(`gift-${g.day}`),
        onSelect: () => {
          update((s) => discover(s, `gift-${g.day}`, 1));
          setObservation(
            "A passing neighbor presses a star-marked coin into your palm. “For when the world gets a little puzzling.” (+1 hint coin)",
          );
        },
      },
      { label: "Head home for the evening", onSelect: goHome },
    );
  } else if (state.screen === "village") {
    caption = "The village is yours";
    text =
      "Bramblewick unfolds beneath a lilac sky. A bell tower leans over the rooftops, warm light spills from the library, and the mushroom market smells faintly of cinnamon. Where will the afternoon take you?";
    locations.forEach((location, index) =>
      choices.push({
        label: `Visit ${location.name}`,
        detail: location.description,
        onSelect: () => {
          setObservation(null);
          update((s) => visitLocation(s, index));
        },
      }),
    );
    choices.push(
      {
        label: "Meet Orin",
        detail: "The gentle gargoyle",
        onSelect: () => meet("orin"),
      },
      {
        label: "Meet Lucien",
        detail: "The night librarian",
        onSelect: () => meet("lucien"),
      },
      { label: "Back to the bakery", onSelect: goHome },
    );
  } else if (g.phase === "work") {
    speaker = recipe.customer;
    caption = `Customer ${g.orders + 1} of 2 · ${recipe.name}`;
    text = `“${recipe.quote}”`;
    choices.push(
      {
        label: "Let’s get baking",
        detail: `Prepare a ${recipe.name.toLowerCase()}`,
        kind: "primary",
        onSelect: () => setOverlay("baking"),
      },
      {
        label: "Back to the bakery",
        onSelect: () => changeScene({ room: true }),
      },
    );
  } else if (g.phase === "free") {
    caption = "The afternoon is yours · one activity";
    choices.push(
      {
        label: "Wander into town",
        kind: "primary",
        detail: "Explore, follow a rumor, or meet a friend",
        onSelect: () => changeScene({ screen: "village" }),
      },
      { label: "Spend time with Orin", onSelect: () => meet("orin") },
      { label: "Spend time with Lucien", onSelect: () => meet("lucien") },
    );
  } else {
    caption = `A quiet evening · Bakery level ${g.level}`;
    choices.push(
      {
        label: "Go to bed",
        kind: "primary",
        detail: "A fresh start tomorrow",
        onSelect: () => {
          setObservation(null);
          update(sleep);
        },
      },
      {
        label: "Tend to the bakery",
        detail: "Browse improvements for your hearth",
        onSelect: () => setOverlay("upgrades"),
      },
      {
        label: "Read the quest journal",
        onSelect: () => setOverlay("journal"),
      },
    );
    for (const n of ["orin", "lucien"] as Npc[])
      if (eligible(g, n))
        choices.push({
          label: `I should talk to ${characters[n].name} tomorrow…`,
          kind: "romance",
          detail:
            g.scheduled === n
              ? "Meeting planned · sleep when you’re ready"
              : "Choose the next chapter",
          onSelect: () => {
            update((s) => scheduleEnding(s, n));
            notify(
              `A meeting with ${characters[n].name} is planned for tomorrow. Go to bed when ready.`,
            );
          },
        });
  }
  const actionRef = useRef(choices);
  actionRef.current = choices;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        roomVisible ||
        menu ||
        overlay ||
        puzzle ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat
      )
        return;
      const target = e.target as HTMLElement;
      if (target.closest("input,textarea,select,summary")) return;
      const index = Number(e.key) - 1;
      if (index >= 0 && index < actionRef.current.length) {
        const choice = actionRef.current[index];
        if (!choice.disabled) {
          e.preventDefault();
          choice.onSelect();
        }
      } else if (
        (e.key === "Enter" || e.key === " ") &&
        actionRef.current[0]?.label === "Continue" &&
        !target.closest("button")
      ) {
        e.preventDefault();
        actionRef.current[0].onSelect();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menu, overlay, puzzle, roomVisible]);
  const overlayTitle =
    overlay === "journal"
      ? "Quest journal"
      : overlay === "people"
        ? "Relationships"
        : overlay === "recipes"
          ? "Recipe book"
          : overlay === "upgrades"
            ? "Your bakery"
            : overlay === "baking"
              ? "At the workbench"
              : "Settings & save";
  return (
    <div
      className={"novel-app " + (roomVisible ? "room-mode" : "dialogue-mode")}
      ref={frame}
    >
      <SceneStage
        scene={scene}
        actor={state.intro !== null ? undefined : actor}
      />
      <div className="cinema-frame" aria-hidden="true" />
      <header className="game-hud">
        <div className="game-wordmark">
          <span>☾</span>
          <div>
            NETHERWORLD<small>BAKERY</small>
          </div>
        </div>
        <div className="day-badge">
          {g.phase === "evening" || g.phase === "ending" ? (
            <Moon size={17} />
          ) : (
            <Sun size={17} />
          )}
          <span>
            Day {g.day}
            <small>
              {g.phase === "work"
                ? "Morning"
                : g.phase === "free"
                  ? "Afternoon"
                  : g.phase === "ending"
                    ? "A new chapter"
                    : "Evening"}
            </small>
          </span>
        </div>
        <div className="hud-currency">
          <span title="Bakery coins">
            <Coins size={16} />
            {g.money}
          </span>
          <span title="Hint coins">
            <Sparkles size={16} />
            {g.coins}
          </span>
        </div>
        <nav className="quick-menu" aria-label="Game menus">
          {[
            { id: "journal" as const, label: "Quest journal", icon: BookOpen },
            { id: "people" as const, label: "Relationships", icon: Heart },
            { id: "recipes" as const, label: "Recipe book", icon: ShoppingBag },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-label={label}
              title={label}
              onClick={() => setOverlay(id)}
            >
              <Icon size={18} />
            </button>
          ))}
          <button
            aria-label="Save game"
            title="Manual save"
            onClick={() => {
              save();
              notify(useGame.getState().notice);
            }}
          >
            <Save size={18} />
          </button>
          <button
            aria-label="Settings and save"
            title="Settings & save"
            onClick={() => setOverlay("settings")}
          >
            <Settings size={18} />
          </button>
          <button
            className="fullscreen-button"
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </nav>
      </header>
      {!roomVisible && (
        <div className="location-marker">
          <span>
            <MapPin size={12} />
            {scene === "bakery" ? "YOUR LITTLE CORNER" : "BRAMBLEWICK"}
          </span>
          <h1>{sceneNames[scene]}</h1>
          <div className="location-rule">
            <i />✦<i />
          </div>
        </div>
      )}
      {roomVisible && <BakeryRoom game={g} onInteract={interactWithRoom} />}
      {state.intro === null &&
        !roomVisible &&
        !talk &&
        visit === null &&
        g.phase === "work" && (
          <aside className="order-note" aria-label="Customer order">
            <span className="eyebrow">A WISH, FRESHLY ORDERED</span>
            <h2>{recipe.name}</h2>
            <p>
              {recipe.base}
              <span> · </span>
              {recipe.filling}
              <br />
              {recipe.topping}
            </p>
            <div>
              <Coins size={13} />
              12–{24 + (g.level - 1) * 2} coins<span>✦</span>
            </div>
          </aside>
        )}
      {g.phase === "ending" && g.ending && (
        <div className="ending-credits">
          <span className="eyebrow">A BRAMBLEWICK LOVE STORY</span>
          <h2>A life, freshly baked.</h2>
          <p>Rowan & {characters[g.ending].name}</p>
          <span>✧</span>
        </div>
      )}
      {!roomVisible && (
        <div className="scene-footnote">
          <span>
            <Flame size={13} />
            Hearth level {g.level}
          </span>
          <span>
            <VolumeX size={12} />A quiet world
          </span>
          <span className="save-indicator">● Your story is kept</span>
        </div>
      )}
      {!roomVisible && (
        <DialogueBox
          speaker={speaker}
          caption={caption}
          text={text}
          choices={choices}
        >
          {observation && visit === null && (
            <p className="observation">{observation}</p>
          )}
        </DialogueBox>
      )}
      {toast && (
        <div className="toast" role="status">
          <Sparkles size={16} />
          {toast}
        </div>
      )}
      {menu && (
        <GameOverlay
          title="Netherworld Bakery"
          onClose={() => {
            if (g.started) setMenu(false);
          }}
        >
          <div className="title-menu">
            <div className="title-moon">
              ☾<i>✦</i>
            </div>
            <span className="eyebrow">A COZY NARRATIVE ADVENTURE</span>
            <h2>
              Netherworld
              <br />
              <em>Bakery</em>
            </h2>
            <p>
              A little flour. A little magic.
              <br />
              Someone worth coming home to.
            </p>
            <button className="primary full" onClick={start}>
              Begin a new story
            </button>
            {g.started && (
              <button className="full" onClick={() => setMenu(false)}>
                Continue your story
              </button>
            )}
            <button className="full" onClick={loadChapter}>
              Load saved story
            </button>
            <small>Chapter I · A fresh start</small>
          </div>
        </GameOverlay>
      )}
      {overlay && (
        <GameOverlay
          title={overlayTitle}
          wide={overlay !== "settings"}
          onClose={() => setOverlay(null)}
        >
          {overlay === "baking" ? (
            <Baking
              index={recipeIndex}
              draft={g.baking}
              bonus={(g.level - 1) * 2}
              onDraft={(draft) =>
                update((s) =>
                  s.phase === "work" &&
                  s.workStarted &&
                  s.day === g.day &&
                  s.orders === g.orders
                    ? { ...s, baking: draft }
                    : s,
                )
              }
              onDone={(score) => {
                const before = g.money;
                update((s) => bake(s, score));
                setOverlay(null);
                notify(
                  `A happy customer. +${useGame.getState().game.money - before} coins.`,
                );
              }}
            />
          ) : overlay === "journal" ? (
            <QuestJournal
              onTown={() => {
                setOverlay(null);
                if (g.phase === "free") changeScene({ screen: "village" });
                else
                  notify(
                    "You can follow this rumor during tomorrow’s free time.",
                  );
              }}
            />
          ) : overlay === "recipes" ? (
            <RecipeBook />
          ) : overlay === "people" ? (
            <Relationships onTalk={meet} />
          ) : overlay === "upgrades" ? (
            <BakeryUpgrades />
          ) : (
            <SystemMenu
              notify={notify}
              onLoad={loadChapter}
              onReset={() => {
                newGame();
                update((s) => ({
                  ...s,
                  scene: { ...initialScene(), intro: 0 },
                }));
                setOverlay(null);
                setObservation(null);
              }}
              onMenu={() => {
                setOverlay(null);
                setMenu(true);
              }}
            />
          )}
        </GameOverlay>
      )}
      {puzzle && (
        <GameOverlay title="A little mystery" onClose={() => setPuzzle(null)}>
          <Puzzle
            id={puzzle}
            key={puzzle}
            onClose={() => {
              setPuzzle(null);
              setObservation(
                "The village seems a little less mysterious now. Or perhaps you are simply learning how to listen.",
              );
            }}
          />
        </GameOverlay>
      )}
    </div>
  );
}
