import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1360, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: /Tie on your apron/ }).click();
async function seed(patch) {
  await page.evaluate((p) => {
    const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
    localStorage.setItem("netherworld-save-v1", JSON.stringify({ ...s, ...p }));
  }, patch);
  await page.reload();
}
for (const [location, answer] of [
  ["Moonlit Library", "42"],
  ["Mushroom Square", "Cora"],
]) {
  await seed({ phase: "free" });
  await page.getByRole("button", { name: /Wander into town/ }).click();
  await page
    .getByRole("button", { name: new RegExp(`Visit ${location}`) })
    .click();
  await page.getByRole("button", { name: "Investigate the mystery" }).click();
  if (answer === "42") await page.getByRole("spinbutton").fill(answer);
  else await page.getByRole("button", { name: answer, exact: true }).click();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await page.getByText("✦ Solved!", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Back to exploring" }).click();
  await page.getByRole("button", { name: "Head home for the evening" }).click();
}
await seed({ phase: "free", affection: { orin: 4, lucien: 6 }, flags: [] });
await page.getByRole("button", { name: "Relationships", exact: true }).click();
await page
  .getByText("Orin needs his bell restored", { exact: false })
  .waitFor();
await page.getByRole("button", { name: "Share a little time" }).nth(1).click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.getByRole("button", { name: "“May I kiss you?”" }).click();
const saved = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("netherworld-save-v1")),
);
if (!saved.final.lucien || !saved.romance.lucien)
  throw new Error("Explicit romance failed");
await seed({
  phase: "evening",
  level: 5,
  affection: { orin: 8, lucien: 8 },
  flags: ["bell"],
  romance: { orin: true, lucien: true },
  final: { orin: true, lucien: true },
});
await page.getByRole("button", { name: "Save game", exact: true }).click();
for (const name of ["Orin", "Lucien"]) {
  await page
    .getByRole("button", {
      name: new RegExp(`I should talk to ${name} tomorrow`),
    })
    .click();
  await page.getByRole("button", { name: /Go to bed/ }).click();
  await page.getByText("A table for two", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "“There’s always room for you.” ♡" })
    .click();
  await page.getByRole("heading", { name: "A life, freshly baked." }).waitFor();
  await page.getByRole("button", { name: "Load an earlier save" }).click();
  await page.getByRole("button", { name: /Go to bed/ }).waitFor();
}
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: sequence and deduction puzzles, quest-gated relationship, explicit romance, both scheduled endings and earlier-save recovery.",
);
await browser.close();
