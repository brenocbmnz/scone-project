import { contoursFor, contourBounds, type Contour } from "./contours";
import { recipes } from "../../game/data";
export type Category = "base" | "filling" | "topping";
export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  width: number;
  height: number;
  color: string;
  contours: Contour[];
}
const colors: Record<string, string> = {
  Moonberry: "#aa75be",
  "Ember apple": "#db8c63",
  "Vanilla cloud": "#f1e2bc",
  "Cinnamon icing": "#b57e59",
  "Star sugar": "#ffe1a0",
  Cinnamon: "#ae7956",
  Pearls: "#e4d5ec",
  "Sugar sprinkles": "#e9b5cd",
};
export const ingredients: Ingredient[] = (
  ["base", "filling", "topping"] as Category[]
).flatMap((category) =>
  [...new Set(recipes.map((r) => r[category]))].map((name) => {
    const contours = contoursFor(name, category),
      bounds = contourBounds(contours);
    return {
      id: `${category}:${name}`,
      name,
      category,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      color: colors[name] ?? "#e7b77c",
      contours,
    };
  }),
);
export const ingredientById = (id: string) =>
  ingredients.find((i) => i.id === id);
export interface Requirement {
  ingredientId: string;
  count: number;
}
export const requirementsFor = (
  recipe: (typeof recipes)[number],
): Requirement[] =>
  (["base", "filling", "topping"] as Category[]).map((category) => ({
    ingredientId: `${category}:${recipe[category]}`,
    count: 1,
  }));
