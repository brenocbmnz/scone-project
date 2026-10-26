import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: "reduce" });
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
for (let i = 0; i < 3; i++) await page.keyboard.press("1");
const base = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("netherworld-save-v1")),
);
async function fits(label) {
  const issues = await page.locator(".baking-modal").evaluate((box) => {
    const failures = [];
    const backdrop = box.parentElement;
    if (
      backdrop.scrollHeight > backdrop.clientHeight + 1 ||
      backdrop.scrollWidth > backdrop.clientWidth + 1
    )
      failures.push("Baking backdrop scrolls");
    const bounds = box.getBoundingClientRect();
    for (const el of [
      box,
      ...box.querySelectorAll(
        ".signature-game,.baking-station,button,input,.signature-board,.primer-controls",
      ),
    ]) {
      if (
        !el.getClientRects().length ||
        getComputedStyle(el).visibility === "hidden"
      )
        continue;
      const r = el.getBoundingClientRect();
      if (
        r.width === 0 ||
        r.height === 0 ||
        r.top < -1 ||
        r.left < -1 ||
        r.bottom > innerHeight + 1 ||
        r.right > innerWidth + 1
      )
        failures.push(
          `${el.className?.baseVal ?? el.className}: ${JSON.stringify(r.toJSON())}`,
        );
      if (
        el !== box &&
        (r.top < bounds.top ||
          r.bottom > bounds.bottom ||
          r.left < bounds.left ||
          r.right > bounds.right)
      )
        failures.push(`Clipped ${el.tagName}: ${r.bottom}/${bounds.bottom}`);
      if (el === box && el.scrollHeight > el.clientHeight + 1)
        failures.push(`Dialog scrolls ${el.scrollHeight}/${el.clientHeight}`);
    }
    return failures;
  });
  expect(issues, label).toEqual([]);
}
for (const [width, height] of [
  [1366, 768],
  [390, 844],
  [360, 640],
  [844, 390],
]) {
  await page.setViewportSize({ width, height });
  for (const [id, level, day, orders] of [
    ["ember", 1, 1, 0],
    ["moon", 2, 1, 1],
    ["ghost", 3, 2, 0],
    ["cinnamon", 4, 2, 1],
  ]) {
    await page.evaluate(
      (save) =>
        localStorage.setItem("netherworld-save-v1", JSON.stringify(save)),
      {
        ...base,
        level,
        day,
        orders,
        phase: "work",
        started: true,
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
      },
    );
    await page.reload();
    await page.getByRole("button", { name: "Let’s get baking" }).click();
    await fits(`${width}x${height} ${id} tutorial`);
    await page
      .getByRole("button", { name: "Start baking", exact: true })
      .click();
    await fits(`${width}x${height} ${id} play`);
    if (id === "moon" || id === "ghost")
      await page.screenshot({ path: `artifacts/fitted-${id}-${width}.png` });
    await page
      .getByRole("button", { name: "How to play", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Resume baking", exact: true }),
    ).toBeVisible();
    await fits(`${width}x${height} ${id} help`);
    await page
      .getByRole("button", { name: "Resume baking", exact: true })
      .click();
    await fits(`${width}x${height} ${id} resumed`);
    await page.evaluate(() => {
      const save = JSON.parse(localStorage.getItem("netherworld-save-v1"));
      save.baking.stage = "result";
      save.baking.legacyScore = 2;
      localStorage.setItem("netherworld-save-v1", JSON.stringify(save));
    });
    await page.reload();
    await page.getByRole("button", { name: "Let’s get baking" }).click();
    await fits(`${width}x${height} ${id} result`);
    await expect(
      page.getByRole("button", { name: "Collect payment", exact: true }),
    ).toBeVisible();
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    await fits(`${width}x${height} ${id} keyboard navigation`);
  }
}
await browser.close();
console.log(
  "All four baking games fit desktop, phone, and landscape viewports without scrolling.",
);
