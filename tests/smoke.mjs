import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Tie on your apron/ }).click();
await page.waitForTimeout(650);
await page.screenshot({ path: "artifacts/bakery-desktop.png", fullPage: true });
for (const r of [
  ["Crescent", "Moonberry", "Star sugar"],
  ["Bun", "Ember apple", "Cinnamon"],
]) {
  await page.getByRole("button", { name: "Let’s get baking" }).click();
  for (const name of r)
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Into the oven" }).click();
  await page.getByRole("button", { name: "Warm the oven" }).click();
  await page.waitForTimeout(2200);
  await page.getByRole("button", { name: "Take it out" }).click();
  await page.getByRole("button", { name: "Time to decorate" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /Add .* ·/ }).click();
  await page.getByRole("button", { name: "Serve with love" }).click();
  await page.getByRole("button", { name: "Collect payment" }).click();
}
await page.getByRole("button", { name: "Wander into town" }).click();
await page.getByRole("button", { name: "Visit Bell Tower" }).click();
await page.getByRole("button", { name: /Examine Mossy gargoyle/ }).click();
await page.getByRole("button", { name: "Investigate the mystery" }).click();
await page.getByRole("button", { name: "Reveal a hint" }).click();
for (const name of ["Bronze", "Gold", "Silver"])
  await page.getByRole("button", { name: "♧ " + name, exact: true }).click();
await page.getByRole("button", { name: "Check my answer" }).click();
await page.getByText("✦ Solved!", { exact: false }).waitFor();
await page.getByRole("button", { name: "Back to exploring" }).click();
await page.getByRole("button", { name: "Head home for the evening" }).click();
await page.getByRole("button", { name: /Tend to the bakery/ }).click();
await page
  .getByRole("button", { name: "35 coins · Upgrade", exact: true })
  .click();
await page
  .getByRole("button", { name: "Close Your bakery", exact: true })
  .click();
await page.getByRole("button", { name: "Save game", exact: true }).click();
await page.getByRole("button", { name: /Go to bed/ }).click();
await page.getByText("Day 2", { exact: false }).waitFor();
await page.reload();
await page.getByText("Day 2", { exact: false }).waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(650);
await page.screenshot({ path: "artifacts/bakery-mobile.png", fullPage: true });
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw new Error("Horizontal overflow");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: two full bakes, exploration, hint, puzzle, quest, upgrade, save, next day, reload and mobile viewport.",
);
await browser.close();
