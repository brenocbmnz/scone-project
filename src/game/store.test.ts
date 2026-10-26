import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { initial } from "./rules";
import { useGame } from "./store";
const write = vi.fn();
beforeEach(() => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: write });
  write.mockClear();
  useGame.setState({ game: initial(), notice: "" });
});
afterEach(() => vi.unstubAllGlobals());
it("does not write a save or notify the UI when a rejected action returns the current state", () => {
  const listener = vi.fn();
  const unsubscribe = useGame.subscribe(listener);
  useGame.getState().update((s) => s);
  expect(write).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});
it("still saves and publishes real progress immediately", () => {
  useGame.getState().update((s) => ({ ...s, money: s.money + 4 }));
  expect(useGame.getState().game.money).toBe(29);
  expect(write).toHaveBeenCalledOnce();
  expect(JSON.parse(write.mock.calls[0][1]).money).toBe(29);
});
