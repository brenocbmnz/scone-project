import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  hasTouch: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
for (let i = 0; i < 2; i++)
  await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Tie on your apron/ }).click();
await page
  .getByRole("button", { name: "Start work day at cash register" })
  .click();
await page.getByRole("button", { name: /Let’s get baking/ }).click();
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("netherworld-save-v1")));
async function choose(category, name) {
  await page.getByRole("tab", { name: category }).click();
  await page.getByRole("button", { name: `Pick ${name}`, exact: true }).click();
}
async function drop(x) {
  const board = page.getByRole("button", {
    name: "Place selected ingredient on the plate",
  });
  if (x === undefined)
    await page
      .getByRole("button", { name: "Place ingredient", exact: true })
      .click();
  else {
    const rect = await board.boundingBox();
    await board.click({
      position: { x: rect.width * x, y: rect.height * 0.2 },
    });
  }
  await expect(
    page.getByRole("button", { name: "Place ingredient", exact: true }),
  ).toBeEnabled();
}
await choose("01 Dough & pastry", "Crescent");
await drop();
await expect(page.locator(".stack-score>strong")).toHaveText("1 / 3");
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.getByRole("button", { name: "Save game", exact: true }).click();
await page.reload();
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await expect(page.locator(".stack-score>strong")).toHaveText("1 / 3");
await choose("02 Fillings & icing", "Moonberry");
await drop();
await choose("03 Toppings", "Star sugar");
await drop();
await drop();
await expect(page.locator(".stack-score>strong")).toHaveText("3 / 3");
await page.screenshot({ path: "artifacts/stacking-game.png" });
await page.getByRole("button", { name: "Serve my creation" }).click();
await expect(page.getByRole("heading", { name: "Perfect!" })).toBeVisible();
const collect = await page
  .getByRole("button", { name: "Collect payment" })
  .elementHandle();
await collect.evaluate((button) => {
  button.click();
  button.click();
});
const first = await state();
if (first.money !== 49 || first.orders !== 1 || first.baking !== null)
  throw new Error("Payout duplicated or old session resurrected");
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await choose("01 Dough & pastry", "Bun");
await drop(0.94);
await expect(page.locator(".stack-score>strong")).toHaveText("0 / 3");
if ((await state()).baking.pieces[0].status !== "lost")
  throw new Error("Off-plate ingredient scored");
await page.getByRole("button", { name: "Undo last ingredient" }).click();
await drop(0.5);
await choose("02 Fillings & icing", "Ember apple");
await drop();
await choose("03 Toppings", "Star sugar");
await drop();
await expect(page.locator(".stack-score>strong")).toHaveText("2 / 3");
await choose("03 Toppings", "Cinnamon");
await drop();
await expect(page.locator(".stack-score>strong")).toHaveText("3 / 3");
await page.getByRole("button", { name: "Serve my creation" }).click();
await page.getByRole("button", { name: "Collect payment" }).click();
if ((await state()).phase !== "free")
  throw new Error("Stacking did not complete daily work");
// Play the cinnamon roll through keyboard controls on a touch-sized viewport.
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
  localStorage.setItem(
    "netherworld-save-v1",
    JSON.stringify({
      ...s,
      day: 2,
      phase: "work",
      orders: 1,
      workStarted: true,
      baking: null,
      scene: {
        screen: "home",
        room: false,
        visit: null,
        talk: null,
        beat: 0,
        intro: null,
      },
    }),
  );
});
await page.reload();
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await expect(
  page
    .getByRole("dialog", { name: "At the workbench" })
    .getByRole("heading", { name: "Cinnamon Roll", exact: true }),
).toBeVisible();
for (const [category, name] of [
  ["01 Dough & pastry", "Roll"],
  ["02 Fillings & icing", "Cinnamon icing"],
  ["03 Toppings", "Sugar sprinkles"],
]) {
  await choose(category, name);
  if (name === "Sugar sprinkles")
    await page
      .getByRole("button", { name: "Place selected ingredient on the plate" })
      .tap();
  else {
    await page
      .getByRole("button", { name: "Place ingredient", exact: true })
      .focus();
    await page.keyboard.press("Enter");
  }
  await expect(
    page.getByRole("button", { name: "Place ingredient", exact: true }),
  ).toBeEnabled();
}
await expect(page.locator(".stack-score>strong")).toHaveText("3 / 3");
await page.getByRole("button", { name: "Serve my creation" }).click();
await page.screenshot({
  path: "artifacts/stacking-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.reload();
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await expect(
  page.getByRole("button", { name: "Collect payment" }),
).toBeVisible();
await page.getByRole("button", { name: "Collect payment" }).click();
if ((await state()).phase !== "free")
  throw new Error("Resumed served session failed");
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw new Error("Mobile overflow");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: stacking, off-plate falls, correct-item scoring, duplicate caps, wrong ingredients, undo, save/resume, single payout, cinnamon roll, mobile keyboard play.",
);
await browser.close();
