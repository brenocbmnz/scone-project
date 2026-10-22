import { Map, Check, Heart, ArrowUpRight, Sparkles } from "lucide-react";
import { useGame } from "../game/store";
import {
  characters,
  recipes,
  quests,
  locations,
  upgrades,
  type Npc,
} from "../game/data";
import { relationshipLevel, upgrade } from "../game/rules";
import { Pastry, Portrait } from "./Art";
export function Relationships({ onTalk }: { onTalk: (n: Npc) => void }) {
  const { game: g } = useGame();
  const npcNames = Object.keys(characters) as Npc[];
  return (
    <div className="people-grid">
      {npcNames.map((n) => {
        const c = characters[n];
        const level = relationshipLevel(g, n);
        return (
          <article className="person-card" key={n}>
            <div className="person-art" style={{ background: c.color + "28" }}>
              <Portrait who={n} />
              <span>✦</span>
            </div>
            <span className="eyebrow">{c.role}</span>
            <h2>{c.name}</h2>
            <div className="hearts">
              {[1, 2, 3, 4, 5].map((i) => (
                <Heart
                  key={i}
                  size={20}
                  fill={i <= level ? "currentColor" : "none"}
                  opacity={i <= level ? 1 : 0.3}
                />
              ))}
            </div>
            <p>
              {g.affection[n] === 0
                ? "Every good story starts with hello."
                : g.romance[n]
                  ? "There’s something more between you."
                  : "A friendship, slowly taking root."}
            </p>
            <p className="muted">
              Level {level} / 5 · {g.affection[n]} affection ·{" "}
              {g.final[n]
                ? "Heart event complete"
                : g.romance[n]
                  ? "Romantic interest expressed"
                  : "Friends, for now"}
            </p>
            {n === "orin" && level >= 3 && !g.flags.includes("bell") && (
              <p className="requirement">
                Orin needs his bell restored before he can open his heart.
                Investigate the Bell Tower.
              </p>
            )}
            <button
              disabled={g.phase !== "free"}
              className="primary"
              onClick={() => onTalk(n)}
            >
              Share a little time <Heart size={15} />
            </button>
          </article>
        );
      })}
    </div>
  );
}
export function QuestJournal({ onTown }: { onTown: () => void }) {
  const { game: g } = useGame();
  return (
    <div className="journal-layout">
      <div>
        {quests.map((q) => (
          <article className="quest-card" key={q.id}>
            <div className="section-heading">
              <span className="eyebrow">
                {g.flags.includes(q.id)
                  ? "COMPLETED"
                  : g.flags.includes("rumor-" + q.id)
                    ? "ACTIVE QUEST"
                    : "VILLAGE RUMOR"}
              </span>
              {g.flags.includes(q.id) && <Check size={20} />}
            </div>
            <h2>{q.name}</h2>
            <p>{q.rumor}</p>
            <div className="quest-objective">
              <Map size={18} />
              <div>
                <strong>{q.objective}</strong>
                <small>Where to look: {q.location} · Prerequisites: none</small>
              </div>
            </div>
            <p className="muted">Reward: {q.reward}</p>
            <button onClick={() => onTown()}>
              Find it in town <ArrowUpRight size={14} />
            </button>
          </article>
        ))}
      </div>
      <section className="today-card">
        <span className="eyebrow">YOUR STORY SO FAR</span>
        <h2>Small steps, sweet things.</h2>
        <p>{g.totalOrders} pastries shared</p>
        <p>{g.solved.length} / 3 mysteries solved</p>
        <p>
          {g.flags.filter((f) => f === "bell" || f === "lantern").length} / 2
          quests completed
        </p>
        <p>{g.collected.length} little discoveries</p>
        <p className="muted">
          Endings open when the bakery and a relationship reach level 5, and you
          complete a romantic heart event. The next chapter is always your
          choice.
        </p>
      </section>
    </div>
  );
}
export function RecipeBook() {
  return (
    <>
      <div className="recipe-grid">
        {recipes.map((r) => (
          <article className="recipe-card" key={r.id}>
            <Pastry variant={r.base} color={r.color} stars={3} />
            <span className="eyebrow">A HOUSE FAVORITE</span>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            <div className="recipe-ingredients">
              {r.base} <span>+</span> {r.filling} <span>+</span> {r.topping}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function BakeryUpgrades() {
  const { game: g, update } = useGame();
  return (
    <section className="upgrades">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ROOM TO GROW</span>
          <h2>A little better, every day.</h2>
        </div>
        <span>Bakery level {g.level} / 5</span>
      </div>
      <div className="upgrade-grid">
        {upgrades.map((u, i) => (
          <article key={u.name} className={g.level > i + 1 ? "purchased" : ""}>
            <span className="upgrade-number">0{i + 2}</span>
            <h3>{u.name}</h3>
            <p>{u.description}</p>
            <button
              disabled={g.level !== i + 1 || g.money < u.cost}
              onClick={() => update(upgrade)}
            >
              {g.level > i + 1 ? "✓ Purchased" : `${u.cost} coins · Upgrade`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
