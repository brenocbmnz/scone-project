import {
  ArrowUpRight,
  ChevronRight,
  Coins,
  Flame,
  Check,
  Moon,
} from "lucide-react";
import { BakeryArt, Pastry, Portrait } from "./Art";
import { useGame } from "../game/store";
import { recipes, characters, type Npc } from "../game/data";
import { sleep, eligible, scheduleEnding } from "../game/rules";
interface Props {
  onTown: () => void;
  onJournal: () => void;
  onPeople: () => void;
  onBake: () => void;
  notify: (message: string) => void;
}
export function BakeryDashboard({
  onTown,
  onJournal,
  onPeople,
  onBake,
  notify,
}: Props) {
  const { game: g, update } = useGame();
  const recipe = recipes[((g.day - 1) * 2 + g.orders) % 3];
  const npcNames = Object.keys(characters) as Npc[];
  return (
    <div className="dashboard">
      <div className="left-column">
        <section className="scene">
          <BakeryArt />
          <div className="scene-top">
            <span>
              <i /> The Crumb & Cauldron
            </span>
            <span>EST. THIS VERY MORNING</span>
          </div>
          <div className="scene-caption">
            <div>
              <span className="eyebrow">YOUR BAKERY, YOUR STORY</span>
              <h2>Something good is rising.</h2>
            </div>
            <span className="scene-tag">✦ Cozy as ever</span>
          </div>
        </section>
        <div className="note">
          <span className="note-spark">✧</span>
          <div>
            <strong>A note from your recipe book</strong>
            <p>
              “A perfect pastry is lovely. A pastry made with heart? That’s
              magic.”
            </p>
          </div>
          <span className="note-doodle">♡</span>
        </div>
        <div className="section-heading">
          <h2>Around your little world</h2>
          <button className="text-button" onClick={() => onTown()}>
            Take a look <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="world-cards">
          <button className="world-card" onClick={() => onJournal()}>
            <div className="world-illustration tower-art">
              ♜<span>☾</span>
            </div>
            <div>
              <span className="eyebrow">A WHISPER IN THE VILLAGE</span>
              <h3>The silent bell tower</h3>
              <p>Orin seems a little quieter than usual.</p>
              <span className="card-link">
                Follow the rumor <ChevronRight size={13} />
              </span>
            </div>
          </button>
          <button className="world-card" onClick={() => onPeople()}>
            <div className="world-illustration friend-art">
              <Portrait who="lucien" />
            </div>
            <div>
              <span className="eyebrow">A FAMILIAR FACE</span>
              <h3>Someone to share a scone with</h3>
              <p>A little time together goes a long way.</p>
              <span className="card-link">
                Meet your neighbors <ChevronRight size={13} />
              </span>
            </div>
          </button>
        </div>
      </div>
      <div className="right-column">
        <section className="order-card">
          <div className="section-heading">
            <h2>
              {g.phase === "work"
                ? "On the order board"
                : g.phase === "free"
                  ? "The afternoon is yours"
                  : "A well-earned rest"}
            </h2>
            <span className="paperclip">⌇</span>
          </div>
          {g.phase === "work" ? (
            <>
              <div className="order-meta">
                <span className="status-pill">FRESH ORDER</span>
                <small>{g.orders + 1} of 2 today</small>
              </div>
              <div className="customer">
                <Portrait who="pip" />
                <div>
                  <strong>{recipe.customer}</strong>
                  <small>
                    Your {g.orders === 0 ? "first" : "next"} customer
                  </small>
                </div>
                <span className="customer-heart">♡</span>
              </div>
              <blockquote>“{recipe.quote}”</blockquote>
              <div className="order-pastry">
                <Pastry variant={recipe.base} color={recipe.color} stars={3} />
              </div>
              <h3 className="recipe-title">{recipe.name}</h3>
              <p className="recipe-desc">{recipe.description}</p>
              <div className="order-reward">
                <span>
                  <Coins size={15} /> 12–{24 + (g.level - 1) * 2} coins
                </span>
                <span>A sprinkle of happiness</span>
              </div>
              <button className="primary full" onClick={() => onBake()}>
                <Flame size={17} /> Let’s get baking <ChevronRight size={17} />
              </button>
              <p className="gentle-note">
                No rush. Good things take a little love.
              </p>
            </>
          ) : g.phase === "free" ? (
            <>
              <div className="free-art">
                ☾<span>✦</span>
              </div>
              <h3>Two orders. Many smiles.</h3>
              <p>
                You have time for <strong>one</strong> activity before evening.
                Who—or what—will you find?
              </p>
              <button className="primary full" onClick={() => onTown()}>
                Wander into town <ArrowUpRight size={16} />
              </button>
              <button className="full" onClick={() => onPeople()}>
                Spend time with someone
              </button>
            </>
          ) : (
            <>
              <div className="free-art">☾</div>
              <h3>A warm hearth. A quiet heart.</h3>
              <p>
                Review your journal, improve your bakery, or turn in for the
                night.
              </p>
              <button
                className="primary full"
                onClick={() => {
                  update(sleep);
                  notify("A new day, a fresh batch.");
                }}
              >
                <Moon size={16} /> Go to bed
              </button>
              {npcNames
                .filter((n) => eligible(g, n))
                .map((n) => (
                  <button
                    className="full"
                    key={n}
                    onClick={() => {
                      update((s) => scheduleEnding(s, n));
                      notify(
                        `A special meeting with ${characters[n].name} is planned for tomorrow. Go to bed when ready.`,
                      );
                    }}
                  >
                    I should talk to {characters[n].name} tomorrow…
                  </button>
                ))}
            </>
          )}
        </section>
        <section className="today-card">
          <span className="eyebrow">THE LITTLE THINGS</span>
          <h3>Today’s little goals</h3>
          {[
            [g.orders >= 2, "Bake something lovely"],
            [g.phase === "evening", "Make a little connection"],
            [g.solved.length > 0, "Stay curious"],
          ].map(([done, text]) => (
            <div className="goal" key={String(text)}>
              <span className={done ? "check checked" : "check"}>
                {done && <Check size={12} />}
              </span>
              {text}
            </div>
          ))}
        </section>
        <div className="autosave">
          <span /> Your story saves automatically
        </div>
      </div>
    </div>
  );
}
