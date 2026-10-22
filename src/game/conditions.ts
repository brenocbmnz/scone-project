import type { Progress } from "./rules";
import type { Npc } from "./data";
export type Condition =
  | { kind: "flag"; flag: string }
  | { kind: "affection"; npc: Npc; minimum: number }
  | { kind: "bakery"; minimum: number };
export function meetsConditions(
  s: Progress,
  conditions: readonly Condition[],
): boolean {
  return conditions.every((c) =>
    c.kind === "flag"
      ? s.flags.includes(c.flag)
      : c.kind === "bakery"
        ? s.level >= c.minimum
        : s.affection[c.npc] >= c.minimum,
  );
}
