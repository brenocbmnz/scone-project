import { describe, it, expect } from "vitest";
import { initial, parseSave, sleep } from "./rules";
import {
  initialScene,
  homeNarration,
  introduction,
  locationScenes,
} from "./scenes";
import { visitLocation } from "./exploration";
describe("visual novel scenes and save compatibility", () => {
  it("loads original iteration saves without losing progression", () => {
    const { scene, ...old } = {
      ...initial(),
      day: 4,
      money: 150,
      flags: ["bell"],
    };
    const restored = parseSave(JSON.stringify(old));
    expect(restored).toMatchObject({
      day: 4,
      money: 150,
      flags: ["bell"],
      scene: initialScene(),
    });
  });
  it("resumes an exploration scene without spending a second afternoon", () => {
    const state = visitLocation({ ...initial(), phase: "free" }, 1);
    const restored = parseSave(JSON.stringify(state));
    expect(restored?.scene.visit).toBe(1);
    expect(restored?.phase).toBe("evening");
    expect(locationScenes[restored!.scene.visit!]).toBe("library");
    expect(visitLocation(restored!, 2)).toBe(restored);
  });
  it("resumes a conversation at its saved beat", () => {
    const state = {
      ...initial(),
      phase: "free" as const,
      scene: { ...initialScene(), talk: "lucien" as const, beat: 1 },
    };
    expect(parseSave(JSON.stringify(state))?.scene).toEqual(state.scene);
  });
  it("rejects invalid scene and dialogue cursors", () => {
    for (const patch of [
      { visit: 3 },
      { talk: "unknown" },
      { intro: 3 },
      { beat: 2 },
      { screen: "unknown" },
      { talk: "orin" },
    ])
      expect(
        parseSave(
          JSON.stringify({
            ...initial(),
            scene: { ...initialScene(), ...patch },
          }),
        ),
      ).toBeNull();
  });
  it("resets the scene on a new day", () => {
    expect(
      sleep({
        ...initial(),
        phase: "evening",
        scene: { ...initialScene(), screen: "village" },
      }).scene,
    ).toEqual(initialScene());
  });
  it("provides authored introduction and phase-specific narration", () => {
    expect(introduction).toHaveLength(3);
    expect(homeNarration(initial()).text).toContain("Morning");
    expect(homeNarration({ ...initial(), phase: "free" }).speaker).toBe(
      "Rowan",
    );
    expect(
      homeNarration({ ...initial(), phase: "evening", scheduled: "orin" }).text,
    ).toContain("promise");
  });
});
