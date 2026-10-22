import { recipes } from "../../game/data";
import { readStackSession, scoreStack } from "../stacking/physics";
import { requirementsFor } from "../stacking/ingredients";
export type BakingStage = "shape" | "bake" | "finish" | "result";
export interface Mark {
  x: number;
  y: number;
}
export interface BakingSession {
  kind: "tactile-v1";
  recipeId: string;
  stage: BakingStage;
  shaped: number;
  heat: number;
  bakeRating: number | null;
  marks: Mark[];
  assisted: boolean;
  legacyScore?: number;
}
export const freshBaking = (recipeId: string): BakingSession => ({
  kind: "tactile-v1",
  recipeId,
  stage: "shape",
  shaped: 0,
  heat: 0,
  bakeRating: null,
  marks: [],
  assisted: false,
});
export const finishZones = (recipeId: string): Mark[] =>
  recipeId === "moon"
    ? [
        { x: 255, y: 245 },
        { x: 320, y: 300 },
        { x: 410, y: 320 },
        { x: 505, y: 285 },
        { x: 555, y: 215 },
      ]
    : [
        { x: 285, y: 215 },
        { x: 400, y: 180 },
        { x: 515, y: 215 },
        { x: 335, y: 285 },
        { x: 465, y: 285 },
      ];
export const coverage = (s: BakingSession) =>
  finishZones(s.recipeId).filter((zone) =>
    s.marks.some((mark) => Math.hypot(mark.x - zone.x, mark.y - zone.y) <= 58),
  ).length;
export const onPastry = (recipeId: string, mark: Mark) =>
  finishZones(recipeId).some(
    (zone) => Math.hypot(mark.x - zone.x, mark.y - zone.y) <= 76,
  );
export const bakeRating = (heat: number) =>
  heat >= 58 && heat <= 82 ? 2 : heat >= 40 && heat <= 96 ? 1 : 0;
export const cookingScore = (s: BakingSession) =>
  s.legacyScore ??
  Number(s.shaped === 3) +
    Number((s.bakeRating ?? 0) >= 1) +
    Number(coverage(s) >= 3);
export function readBakingSession(value: unknown): BakingSession | null {
  if (!value || typeof value !== "object") return null;
  const s = value as BakingSession;
  if (s.kind !== "tactile-v1") {
    const old = readStackSession(value);
    if (!old) return null;
    // Honor unpaid results from the previous minigame. Unfinished stacks start fresh.
    const next = freshBaking(old.recipeId);
    const recipe = recipes.find((r) => r.id === old.recipeId);
    if (old.served && recipe)
      return {
        ...next,
        stage: "result",
        legacyScore: scoreStack(old.pieces, requirementsFor(recipe))
          .payoutScore,
      };
    return next;
  }
  if (
    !recipes.some((r) => r.id === s.recipeId) ||
    !["shape", "bake", "finish", "result"].includes(s.stage) ||
    !Number.isInteger(s.shaped) ||
    s.shaped < 0 ||
    s.shaped > 3 ||
    !Number.isFinite(s.heat) ||
    s.heat < 0 ||
    s.heat > 100 ||
    ![null, 0, 1, 2].includes(s.bakeRating) ||
    typeof s.assisted !== "boolean" ||
    !Array.isArray(s.marks) ||
    s.marks.length > 160 ||
    !s.marks.every(
      (m) =>
        m &&
        Number.isFinite(m.x) &&
        Number.isFinite(m.y) &&
        onPastry(s.recipeId, m),
    ) ||
    (s.legacyScore !== undefined &&
      (!Number.isInteger(s.legacyScore) ||
        s.legacyScore < 0 ||
        s.legacyScore > 3 ||
        s.stage !== "result"))
  )
    return null;
  if (
    s.legacyScore === undefined &&
    ((s.stage !== "shape" && s.shaped !== 3) ||
      (["finish", "result"].includes(s.stage) &&
        s.bakeRating !== bakeRating(s.heat)))
  )
    return null;
  return {
    kind: "tactile-v1",
    recipeId: s.recipeId,
    stage: s.stage,
    shaped: s.shaped,
    heat: s.heat,
    bakeRating: s.bakeRating,
    marks: s.marks.map((m) => ({ x: m.x, y: m.y })),
    assisted: s.assisted,
    ...(s.legacyScore === undefined ? {} : { legacyScore: s.legacyScore }),
  };
}
export interface Gesture {
  from: Mark;
  to: Mark;
  instruction: string;
  action: string;
}
export function shapeGesture(recipeId: string, step: number): Gesture {
  const i = Math.min(2, step);
  const paths: Record<string, Gesture[]> = {
    moon: [
      {
        from: { x: 400, y: 320 },
        to: { x: 400, y: 170 },
        instruction: "Roll the filled dough upward.",
        action: "Roll dough",
      },
      {
        from: { x: 235, y: 230 },
        to: { x: 310, y: 310 },
        instruction: "Curl the left tip inward.",
        action: "Curl left tip",
      },
      {
        from: { x: 565, y: 230 },
        to: { x: 490, y: 310 },
        instruction: "Curl the right tip to make a crescent.",
        action: "Curl right tip",
      },
    ],
    ember: [
      {
        from: { x: 230, y: 230 },
        to: { x: 400, y: 230 },
        instruction: "Fold the left edge over the apple filling.",
        action: "Fold left edge",
      },
      {
        from: { x: 570, y: 230 },
        to: { x: 400, y: 230 },
        instruction: "Fold the right edge into the middle.",
        action: "Fold right edge",
      },
      {
        from: { x: 400, y: 330 },
        to: { x: 400, y: 210 },
        instruction: "Tuck and seal your little bun.",
        action: "Seal bun",
      },
    ],
    ghost: [
      {
        from: { x: 400, y: 230 },
        to: { x: 245, y: 230 },
        instruction: "Press the dough toward the left rim.",
        action: "Press left rim",
      },
      {
        from: { x: 400, y: 230 },
        to: { x: 555, y: 230 },
        instruction: "Press the dough toward the right rim.",
        action: "Press right rim",
      },
      {
        from: { x: 270, y: 230 },
        to: { x: 530, y: 230 },
        instruction: "Smooth the vanilla cloud across the shell.",
        action: "Smooth filling",
      },
    ],
    cinnamon: [
      {
        from: { x: 240, y: 220 },
        to: { x: 560, y: 220 },
        instruction: "Spread the cinnamon across the dough.",
        action: "Spread cinnamon",
      },
      {
        from: { x: 400, y: 325 },
        to: { x: 400, y: 160 },
        instruction: "Roll the dough into a soft spiral.",
        action: "Roll spiral",
      },
      {
        from: { x: 530, y: 230 },
        to: { x: 420, y: 230 },
        instruction: "Tuck the loose end into the roll.",
        action: "Tuck roll",
      },
    ],
  };
  return (paths[recipeId] ?? paths.moon)[i];
}
export function gestureProgress(g: Gesture, p: Mark) {
  const dx = g.to.x - g.from.x,
    dy = g.to.y - g.from.y;
  const t =
    ((p.x - g.from.x) * dx + (p.y - g.from.y) * dy) / (dx * dx + dy * dy);
  const cross =
    Math.abs((p.x - g.from.x) * dy - (p.y - g.from.y) * dx) /
    Math.hypot(dx, dy);
  return cross <= 95 ? Math.max(0, Math.min(1, t)) : 0;
}
