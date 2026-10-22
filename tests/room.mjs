import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
for (let i = 0; i < 2; i++)
  await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Tie on your apron/ }).click();
const getState = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("netherworld-save-v1")));
await expect(
  page.getByRole("region", { name: "Interactive bakery" }),
).toBeVisible();
await expect(
  page.getByRole("region", { name: "Story and actions" }),
).toHaveCount(0);
await page.getByRole("button", { name: "Go to bed", exact: true }).click();
await page.getByRole("button", { name: "Go outside", exact: true }).click();
if ((await getState()).phase !== "work" || (await getState()).day !== 1)
  throw new Error("Room actions skipped morning");
// Click the illustrated oven away from its marker: the whole appliance is interactive.
await page
  .getByRole("button", { name: "Use enchanted oven" })
  .click({ position: { x: 15, y: 110 } });
await expect(
  page.getByRole("button", { name: "35 coins · Upgrade", exact: true }),
).toBeDisabled();
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Use recipe shelf" }).click();
await expect(
  page.getByRole("heading", { name: "Moonberry Crescent" }),
).toBeVisible();
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Start work day at cash register" })
  .click();
await page.getByRole("button", { name: /Back to the bakery/ }).click();
await page.reload();
await expect(
  page.getByRole("button", { name: "Continue work day at cash register" }),
).toBeVisible();
await page.getByRole("button", { name: "Use mixing table" }).click();
await expect(
  page.getByRole("dialog", { name: "At the workbench" }),
).toBeVisible();
await page.keyboard.press("Escape");
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
  localStorage.setItem(
    "netherworld-save-v1",
    JSON.stringify({ ...s, phase: "free", orders: 2, workStarted: false }),
  );
});
await page.reload();
await page.getByRole("button", { name: "Talk to Orin", exact: true }).click();
await expect(
  page.getByRole("heading", { name: "The Crumb & Cauldron" }),
).toBeVisible();
await page.getByRole("button", { name: /Another time, perhaps/ }).click();
if ((await getState()).phase !== "free")
  throw new Error("Declining a conversation consumed free time");
await page.getByRole("button", { name: "Talk to Lucien", exact: true }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /I’m glad we’re friends/ }).click();
await expect(
  page.getByRole("region", { name: "Interactive bakery" }),
).toBeVisible();
await expect(
  page.getByRole("button", { name: "Talk to Orin", exact: true }),
).toHaveCount(0);
await page.getByRole("button", { name: "Go outside", exact: true }).click();
if ((await getState()).phase !== "evening")
  throw new Error("Second afternoon activity became available");
await page.getByRole("button", { name: "Go to bed", exact: true }).click();
if ((await getState()).day !== 2 || (await getState()).workStarted)
  throw new Error("Bed did not reset work day");
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Show interactions" }).click();
await expect(page.getByRole("button", { name: "Hide labels" })).toBeVisible();
await page
  .getByRole("button", { name: "Start work day at cash register" })
  .focus();
await page.keyboard.press("Enter");
await expect(
  page.getByRole("button", { name: /Let’s get baking/ }),
).toBeVisible();
await page.screenshot({ path: "artifacts/coral-dialogue-mobile.png" });
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw new Error("Room or dialogue overflows mobile viewport");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: illustrated appliance hit areas, register gating/resume, room NPC conversations, one afternoon activity, bed progression, and mobile keyboard controls.",
);
await browser.close();
