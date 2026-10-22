import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
await expect(page.getByRole("img", { name: /Rowan, the baker/ })).toBeVisible();
const line = page.locator(".story-line");
await line.click();
await page.waitForTimeout(100);
await expect(line).toHaveAttribute("data-revealing", "false");
await expect(line).toContainText("Well, then. This is home.");
await page.getByRole("button", { name: "Flowing text" }).click();
await expect(
  page.getByRole("button", { name: "Instant text" }),
).toHaveAttribute("aria-pressed", "true");
await page.reload();
await expect(
  page.getByRole("button", { name: "Instant text" }),
).toHaveAttribute("aria-pressed", "true");
await page.getByRole("button", { name: "Log", exact: true }).click();
await expect(
  page.getByRole("dialog", { name: "Conversation log" }),
).toContainText("Well, then. This is home.");
await page.keyboard.press("1");
await expect(page.locator(".speaker-plaque")).toHaveText("✦Rowan✦");
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).toHaveCount(0);
await page.keyboard.press("1");
await expect(line).toContainText("You left the human world");
await page.keyboard.press("1");
await page.keyboard.press("1");
await page.evaluate(() => {
  const save = JSON.parse(localStorage.getItem("netherworld-save-v1"));
  localStorage.setItem(
    "netherworld-save-v1",
    JSON.stringify({ ...save, phase: "free" }),
  );
});
await page.reload();
await page.getByRole("button", { name: "Talk to Orin" }).click();
await page.getByRole("button", { name: /Continue/ }).click();
await expect(page.getByRole("img", { name: /Rowan, the baker/ })).toBeVisible();
await expect(
  page.locator(".scene-companion").getByRole("img", { name: /Orin/ }),
).toBeVisible();
await page.waitForTimeout(300);
await page.screenshot({ path: "artifacts/vn-polish-conversation.png" });
for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  await page.setViewportSize(viewport);
  const bounds = await page.locator(".dialogue-dock").boundingBox();
  if (
    !bounds ||
    bounds.x < 0 ||
    bounds.x + bounds.width > viewport.width ||
    bounds.y + bounds.height > viewport.height
  )
    throw new Error("Dialogue escaped viewport");
}
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: Rowan and companion staging, stable text reveal, persisted pacing, dialogue log shortcut isolation and responsive bounds.",
);
await browser.close();
