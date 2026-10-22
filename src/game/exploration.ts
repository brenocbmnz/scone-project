import { locations, quests } from "./data";
import { meetsConditions } from "./conditions";
import type { Progress } from "./rules";
export function visitLocation(s: Progress, index: number): Progress {
  const location = locations[index];
  if (s.phase !== "free" || !location) return s;
  const rumors = quests
    .filter(
      (q) => q.location === location.name && meetsConditions(s, q.requires),
    )
    .map((q) => "rumor-" + q.id);
  return {
    ...s,
    phase: "evening",
    flags: [...new Set([...s.flags, ...rumors])],
  };
}
export function discover(s: Progress, key: string, reward = 2): Progress {
  if (s.collected.includes(key)) return s;
  return { ...s, coins: s.coins + reward, collected: [...s.collected, key] };
}
