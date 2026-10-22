import { recipes } from "../../game/data";
export type Category = "base" | "filling" | "topping";
export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  width: number;
  height: number;
  color: string;
}
const sizes: Record<Category, [number, number]> = {
  base: [160, 70],
  filling: [108, 30],
  topping: [88, 22],
};
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
  [...new Set(recipes.map((r) => r[category]))].map((name) => ({
    id: `${category}:${name}`,
    name,
    category,
    width:
      name === "Crescent" ? 186 : name === "Tart" ? 174 : sizes[category][0],
    height:
      name === "Bun" ? 82 : name === "Cinnamon icing" ? 20 : sizes[category][1],
    color: colors[name] ?? "#e7b77c",
  })),
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
