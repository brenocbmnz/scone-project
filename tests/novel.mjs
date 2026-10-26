import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
await page.keyboard.press("1");
await expect(page.getByText(/You left the human world looking/)).toBeVisible();
await page.getByRole("button", { name: "Save game", exact: true }).click();
await page.reload();
await expect(page.getByText(/You left the human world looking/)).toBeVisible();
await page.keyboard.press("1");
await page.keyboard.press("1");
await expect(
  page.getByRole("region", { name: "Interactive bakery" }),
).toBeVisible();
await page.getByRole("button", { name: "Quest journal", exact: true }).click();
await page.keyboard.press("Tab");
await expect(page.getByRole("dialog")).toBeVisible();
for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
if (
  !(await page.evaluate(() =>
    document.querySelector('[role="dialog"]').contains(document.activeElement),
  ))
)
  throw new Error("Focus escaped overlay");
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).toHaveCount(0);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
  localStorage.setItem(
    "netherworld-save-v1",
    JSON.stringify({
      ...s,
      phase: "free",
      scene: { screen: "home", visit: null, talk: null, beat: 0, intro: null },
    }),
  );
});
await page.reload();
await page.getByRole("button", { name: "Talk to Orin" }).click();
await page.screenshot({ path: "artifacts/novel-orin.png" });
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: "Save game", exact: true }).click();
await page.reload();
await expect(page.getByText(/You brush flour from your apron/)).toBeVisible();
await page.getByRole("button", { name: /I’m glad we’re friends/ }).click();
const after = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("netherworld-save-v1")),
);
if (
  after.phase !== "evening" ||
  after.affection.orin !== 2 ||
  after.romance.orin
)
  throw new Error("Conversation result incorrect");
await page.getByRole("button", { name: /Go to bed/ }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page
  .getByRole("button", { name: "Settings and save", exact: true })
  .click();
await expect(
  page.getByRole("button", { name: "Save this chapter" }),
).toBeVisible();
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Start work day at cash register" })
  .click();
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await expect(
  page.getByRole("button", { name: "Start baking", exact: true }),
).toBeVisible();
await page.screenshot({
  path: "artifacts/novel-baking-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Close At the workbench" }).click();
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw new Error("Mobile horizontal overflow");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: numbered keyboard choices, intro/conversation resume, modal focus trap/Escape, friendship choice, mobile menus and cooking.",
);
await browser.close();
