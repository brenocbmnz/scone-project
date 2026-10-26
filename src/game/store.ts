import { create } from "zustand";
import { initial, type Progress } from "./rules";
import {
  AUTO_SAVE,
  MANUAL_SAVE,
  readProgress,
  writeProgress,
} from "./persistence";
interface Store {
  game: Progress;
  update: (fn: (s: Progress) => Progress) => void;
  newGame: () => void;
  save: () => void;
  load: () => boolean;
  notice: string;
}
export const useGame = create<Store>((set, get) => ({
  game: readProgress(AUTO_SAVE) ?? initial(),
  notice: "",
  update: (fn) => {
    const previous = get().game;
    const game = fn(previous);
    if (game === previous) return;
    const saved = writeProgress(AUTO_SAVE, game);
    set({
      game,
      ...(!saved
        ? {
            notice:
              "Browser storage is unavailable. Progress will last for this session only.",
          }
        : {}),
    });
  },
  newGame: () => {
    const game = { ...initial(), started: true };
    writeProgress(AUTO_SAVE, game);
    set({ game });
  },
  save: () => {
    const saved = writeProgress(MANUAL_SAVE, get().game);
    set({
      notice: saved
        ? "Progress tucked away safely."
        : "Could not save: browser storage is unavailable.",
    });
  },
  load: () => {
    const game = readProgress(MANUAL_SAVE) ?? readProgress(AUTO_SAVE);
    if (!game) return false;
    writeProgress(AUTO_SAVE, game);
    set({ game, notice: "Welcome back, baker." });
    return true;
  },
}));
