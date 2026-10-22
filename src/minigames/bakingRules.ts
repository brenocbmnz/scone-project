import type { recipes } from "../game/data";
type Recipe = (typeof recipes)[number];
export function evaluatePastry(
  recipe: Recipe,
  ingredients: readonly string[],
  heat: number,
  decorations: number,
): number {
  return (
    Number(
      ingredients.every(
        (s, i) => s === [recipe.base, recipe.filling, recipe.topping][i],
      ) && ingredients.length === 3,
    ) +
    Number(heat >= 35 && heat <= 80) +
    Number(decorations >= 3)
  );
}
