import { startWork } from "./bakeryRoom";
import { describe, it, expect } from "vitest";
import {
  initial,
  upgrade,
  hint,
  solve,
  bake,
  spendTime,
  sleep,
  eligible,
  relationshipLevel,
  parseSave,
  type Progress,
} from "./rules";
import { puzzles } from "./data";
describe("bakery economy and daily progression", () => {
  it("pays every quality tier and permits exactly two orders", () => {
    for (let score = 0; score <= 3; score++) {
      const s = bake(startWork(initial()), score);
      expect(s.money).toBe(37 + score * 4);
    }
    const s = bake(bake(startWork(initial()), 2), 1);
    expect(s.phase).toBe("free");
    expect(bake(s, 3)).toBe(s);
  });
  it("cannot buy unaffordable or out of order upgrades", () => {
    expect(upgrade(initial()).level).toBe(1);
    const s = { ...initial(), phase: "evening" as const, money: 300 };
    const u = upgrade(s);
    expect(u.level).toBe(2);
    expect(u.money).toBe(265);
    expect(s.money).toBe(300);
    let max: Progress = s;
    for (let i = 0; i < 5; i++) max = upgrade(max);
    expect(max.level).toBe(5);
    expect(max.money).toBe(40);
  });
  it("spends exactly one afternoon and advances only from evening", () => {
    const s = { ...initial(), phase: "free" as const };
    expect(sleep(s)).toBe(s);
    const evening = spendTime(s, "lucien", false);
    expect(evening.phase).toBe("evening");
    expect(spendTime(evening, "orin", true)).toBe(evening);
    expect(sleep(evening)).toMatchObject({ day: 2, phase: "work", orders: 0 });
  });
});
describe("relationships and optional endings", () => {
  it("gates Orin at level 3 until the bell quest is done", () => {
    const s = { ...initial(), affection: { orin: 20, lucien: 20 } };
    expect(relationshipLevel(s, "orin")).toBe(3);
    expect(relationshipLevel(s, "lucien")).toBe(5);
    expect(relationshipLevel(solve(s, "bells"), "orin")).toBe(5);
  });
  it("does not turn affection into romance", () => {
    const s = spendTime(
      { ...initial(), phase: "free", affection: { orin: 0, lucien: 8 } },
      "lucien",
      false,
    );
    expect(s.final.lucien).toBe(false);
    expect(s.romance.lucien).toBe(false);
  });
  it("unlocks an ending after an explicit romantic final event and schedules it overnight", () => {
    const s = spendTime(
      {
        ...initial(),
        phase: "free",
        level: 5,
        affection: { orin: 0, lucien: 6 },
      },
      "lucien",
      true,
    );
    expect(eligible(s, "lucien")).toBe(true);
    expect(sleep(s).phase).toBe("work");
    expect(sleep({ ...s, scheduled: "lucien" }).phase).toBe("ending");
  });
});
describe("puzzles and hint coins", () => {
  it("caps hints at three and never overspends", () => {
    let s = { ...initial(), coins: 5 };
    for (let i = 0; i < 5; i++) s = hint(s, "bells");
    expect(s.coins).toBe(2);
    expect(s.hints.bells).toBe(3);
    const poor = { ...initial(), coins: 0 };
    expect(hint(poor, "bells")).toBe(poor);
  });
  it("grants rewards and quest flags only once", () => {
    const s = solve(initial(), "bells");
    expect(s.flags).toContain("bell");
    expect(s.money).toBe(45);
    expect(s.coins).toBe(5);
    expect(solve(s, "bells")).toBe(s);
  });
  it("has a unique bell arrangement satisfying both clues", () => {
    const options = [
      ["Bronze", "Gold", "Silver"],
      ["Bronze", "Silver", "Gold"],
      ["Gold", "Bronze", "Silver"],
      ["Gold", "Silver", "Bronze"],
      ["Silver", "Bronze", "Gold"],
      ["Silver", "Gold", "Bronze"],
    ];
    const valid = options.filter(
      (a) => a.indexOf("Silver") > a.indexOf("Bronze") && a[1] === "Gold",
    );
    expect(valid.map((a) => a.join(","))).toEqual([puzzles.bells.answer]);
  });
  it("has independently derived sequence and deduction answers", () => {
    expect(puzzles.sequence.answer).toBe(String(6 * 7));
    const names = ["Ada", "Bram", "Cora"];
    const pastries = ["bun", "tart", "crescent"];
    const valid = [];
    for (const a of pastries)
      for (const b of pastries)
        for (const c of pastries)
          if (
            new Set([a, b, c]).size === 3 &&
            a !== "bun" &&
            a !== "tart" &&
            b !== "bun"
          )
            valid.push(names[[a, b, c].indexOf("bun")]);
    expect(valid).toEqual([puzzles.deduction.answer]);
  });
});
describe("persistence", () => {
  it("round trips all progress, including flags, hints and scheduled ending", () => {
    const s = {
      ...solve(hint(initial(), "bells"), "bells"),
      scheduled: "orin" as const,
    };
    expect(parseSave(JSON.stringify(s))).toEqual(s);
  });
  it("rejects broken and unknown saves and fills missing fields", () => {
    expect(parseSave("{bad")).toBe(null);
    expect(parseSave('{"version":2,"day":1}')).toBe(null);
    expect(parseSave(JSON.stringify({ ...initial(), money: -4 }))).toBe(null);
    expect(parseSave('{"version":1,"day":2}')).toMatchObject({
      day: 2,
      affection: { orin: 0, lucien: 0 },
      coins: 3,
    });
  });
});

describe("complete prototype storyline", () => {
  it("reaches a chosen ending through normal five-day play", () => {
    let s: Progress = { ...initial(), started: true };
    for (let day = 1; day <= 5; day++) {
      s = bake(bake(startWork(s), 3), 3);
      if (day === 1) s = { ...solve(s, "bells"), phase: "evening" };
      else s = spendTime(s, "orin", true);
      s = upgrade(s);
      if (day < 5) s = sleep(s);
    }
    expect(s.level).toBe(5);
    expect(s.totalOrders).toBe(10);
    expect(eligible(s, "orin")).toBe(true);
    expect(sleep(s).phase).toBe("work");
    expect(sleep({ ...s, scheduled: "orin" })).toMatchObject({
      phase: "ending",
      day: 6,
    });
  });
  it("rejects malformed nested fields and invalid ending state", () => {
    for (const patch of [
      { affection: { orin: -1 } },
      { romance: { lucien: "yes" } },
      { hints: { bells: 4 } },
      { orders: 3 },
      { scheduled: "unknown" },
      { phase: "ending" },
    ])
      expect(parseSave(JSON.stringify({ ...initial(), ...patch }))).toBeNull();
  });
});
