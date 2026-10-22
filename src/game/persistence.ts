import { parseSave, type Progress } from "./rules";
export const AUTO_SAVE = "netherworld-save-v1";
export const MANUAL_SAVE = "netherworld-manual-v1";
export function readProgress(key: string): Progress | null {
  try {
    return parseSave(localStorage.getItem(key));
  } catch {
    return null;
  }
}
export function writeProgress(key: string, game: Progress): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
