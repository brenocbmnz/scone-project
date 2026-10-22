import { it, expect } from "vitest";
import { initial } from "./rules";
import { visitLocation, discover } from "./exploration";
import { getDialogue } from "./dialogue";
it("consumes one afternoon and discovers a structured rumor", () => {
  const start = { ...initial(), phase: "free" as const };
  const visited = visitLocation(start, 0);
  expect(visited.phase).toBe("evening");
  expect(visited.flags).toContain("rumor-bell");
  expect(visitLocation(visited, 1)).toBe(visited);
});
it("never collects the same object twice", () => {
  const s = discover(initial(), "0-0");
  expect(s.coins).toBe(5);
  expect(discover(s, "0-0")).toBe(s);
});
it("selects the prerequisite dialogue until the bell is restored", () => {
  const s = { ...initial(), affection: { orin: 8, lucien: 0 } };
  expect(getDialogue(s, "orin").id).toBe("orin-waiting");
  expect(getDialogue({ ...s, flags: ["bell"] }, "orin").id).toBe("orin-heart");
});
