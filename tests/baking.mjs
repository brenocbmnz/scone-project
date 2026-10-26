import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.clock.install();
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
for (let i = 0; i < 3; i++) await page.keyboard.press("1");
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("netherworld-save-v1")));
async function seed(patch) {
  await page.evaluate((p) => {
    const save = JSON.parse(localStorage.getItem("netherworld-save-v1"));
    localStorage.setItem(
      "netherworld-save-v1",
      JSON.stringify({
        ...save,
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
        ...p,
      }),
    );
  }, patch);
  await page.reload();
  await page.getByRole("button", { name: "Let’s get baking" }).click();
}
async function resultStars(stars) {
  await expect(page.getByLabel(`${stars} of 3 quality stars`)).toBeVisible();
}
async function rhythm() {
  await page
    .getByRole("button", { name: "Start baking", exact: true })
    .click();
  await page.clock.runFor(1400);
  for (let i = 0; i < 6; i++) {
    if (i)
      await page.clock.runFor(
        Math.max(0, 1400 + i * 1050 - (await state()).baking.elapsed),
      );
    await page.getByRole("button", { name: /Knead dough/ }).click();
  }
}
async function puzzle() {
  await page.getByRole("button", { name: "Start baking" }).click();
  for (const [i, name] of [
    "Left curl",
    "Middle fold",
    "Right curl",
  ].entries()) {
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    const current = (await state()).baking.turns[i];
    const target = [3, 0, 1][i];
    for (let n = 0; n < (target - current + 4) % 4; n++)
      await page
        .getByRole("button", {
          name: new RegExp(`^Rotate ${name.toLowerCase()}`),
        })
        .click();
    await page
      .getByRole("button", {
        name: `Place selected dough in space ${i + 1}`,
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Bake my crescent" }).click();
}
// Level one offers only the bun. Rhythm pauses and resumes at the same beat.
await seed({ level: 1, day: 1, orders: 0 });
await expect(
  page.getByRole("heading", { name: "Emberheart Bun", exact: true }),
).toHaveCount(1);
await page.getByRole("button", { name: "Start baking", exact: true }).click();
await page.clock.runFor(1400);
await page.getByRole("button", { name: /Knead dough/ }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
const paused = (await state()).baking;
await page.clock.runFor(3000);
expect((await state()).baking.elapsed).toBe(paused.elapsed);
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await expect(
  page.getByRole("button", { name: "Resume kneading" }),
).toBeVisible();
expect((await state()).baking.beats).toEqual(paused.beats);
expect(paused.beats[0]).toBeGreaterThan(0);
await page.getByRole("button", { name: "Resume kneading" }).click();
for (let i = 1; i < 6; i++) {
  await page.clock.runFor(
    Math.max(0, 1400 + i * 1050 - (await state()).baking.elapsed),
  );
  await page.getByRole("button", { name: /Knead dough/ }).click();
}
await resultStars(3);
const before = await state();
await page
  .getByRole("button", { name: "Collect payment", exact: true })
  .dblclick();
expect((await state()).money - before.money).toBe(24);
expect((await state()).orders).toBe(1);
expect((await state()).baking).toBeNull();
// A delayed animation frame must not slow the game clock or stretch the rhythm.
await seed({ level: 1, day: 1, orders: 0 });
await page.getByRole("button", { name: "Start baking", exact: true }).click();
await page.clock.fastForward(2100);
expect((await state()).baking.beats.length).toBeGreaterThanOrEqual(1);
// Crescent: actual drag-and-drop, rotation, keyboard placement, undo and result resume.
await seed({ level: 2, day: 1, orders: 1 });
await page.getByRole("button", { name: "Start baking" }).click();
let box = await page
  .getByRole("img", { name: "Crescent puzzle board" })
  .boundingBox();
let tile = await page.getByRole("button", { name: /^Left curl/ }).boundingBox();
await page.mouse.move(tile.x + tile.width / 2, tile.y + tile.height / 2);
await page.mouse.down();
await page.mouse.move(
  box.x + (box.width * 225) / 800,
  box.y + (box.height * 225) / 460,
  { steps: 12 },
);
await page.mouse.up();
expect((await state()).baking.tiles[0]).toBe(0);
await page.getByRole("button", { name: /^Rotate left curl/ }).click();
await page.getByRole("button", { name: "Undo fold" }).click();
expect((await state()).baking.turns[0]).toBe(1);
for (const [i, name] of ["Left curl", "Middle fold", "Right curl"].entries()) {
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  for (let n = 0; n < 2; n++)
    await page
      .getByRole("button", {
        name: new RegExp(`^Rotate ${name.toLowerCase()}`),
      })
      .click();
  await page
    .getByRole("button", {
      name: `Place selected dough in space ${i + 1}`,
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
}
await page.getByRole("button", { name: "Bake my crescent" }).click();
await resultStars(3);
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await resultStars(3);
await page.screenshot({ path: "artifacts/pastry-crescent-result.png" });
// Tart: learn from the visible flashes, make one mistake, resume a partly-filled recipe.
await seed({ level: 3, day: 2, orders: 0 });
await page.getByRole("button", { name: "Start baking", exact: true }).click();
const pattern = [];
await page.clock.runFor(400);
for (let i = 0; i < 4; i++) {
  pattern.push(
    (await page.locator(".ingredient-bowls button.flashing").innerText())
      .split("\n")
      .find((line) =>
        [
          "Moonberries",
          "Vanilla cloud",
          "Sugar pearls",
          "Rose petals",
        ].includes(line.trim()),
      )
      .trim(),
  );
  await page.clock.runFor(840);
}
const wrong = [
  "Moonberries",
  "Vanilla cloud",
  "Sugar pearls",
  "Rose petals",
].find((n) => n !== pattern[0]);
await page.getByRole("button", { name: wrong, exact: true }).click();
expect((await state()).baking.mistakes).toBe(1);
for (let i = 0; i < 2; i++)
  await page.getByRole("button", { name: pattern[i], exact: true }).click();
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await page.clock.runFor(4200);
expect((await state()).baking.answers).toHaveLength(2);
for (let i = 2; i < 4; i++)
  await page.getByRole("button", { name: pattern[i], exact: true }).click();
await resultStars(3);
// Roll: no center shortcut, direct painting, lift/resume and equivalent keyboard path.
await seed({ level: 4, day: 2, orders: 1 });
await page.getByRole("button", { name: "Start baking" }).click();
const icing = page.getByRole("img", { name: "Spiral icing board" });
box = await icing.boundingBox();
await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
expect((await state()).baking.traced).toBe(0);
const points = await icing.locator("polyline").first().getAttribute("points");
const path = points.split(" ").map((p) => p.split(",").map(Number));
await page.mouse.move(
  box.x + (box.width * path[0][0]) / 800,
  box.y + (box.height * path[0][1]) / 460,
);
await page.mouse.down();
for (const [x, y] of path.slice(0, 35))
  await page.mouse.move(
    box.x + (box.width * x) / 800,
    box.y + (box.height * y) / 460,
  );
await page.mouse.up();
expect((await state()).baking.traced).toBeGreaterThan(25);
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
const progress = (await state()).baking.traced;
expect(progress).toBeGreaterThan(25);
for (let i = 0; i < 10; i++)
  await page.getByRole("button", { name: /Pipe next section/ }).click();
await page.getByRole("button", { name: "Bake my roll" }).click();
await resultStars(3);
await page.screenshot({ path: "artifacts/pastry-icing-result.png" });
// Sampler: first pastry never pays or consumes a customer; reload keeps the packed score.
await seed({ level: 5, day: 3, orders: 0, money: 25, totalOrders: 0 });
await rhythm();
await page.getByRole("button", { name: /Pack pastry & make/ }).click();
expect((await state()).orders).toBe(0);
expect((await state()).money).toBe(25);
expect((await state()).baking.scores).toEqual([3]);
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await puzzle();
await resultStars(3);
await page.getByRole("button", { name: "Collect payment" }).click();
const sampler = await state();
expect(sampler.money).toBe(89);
expect(sampler.orders).toBe(1);
expect(sampler.totalOrders).toBe(2);
expect(sampler.phase).toBe("work");
// An old, unpaid creation remains collectible even if its recipe is now locked.
await seed({
  level: 1,
  day: 1,
  orders: 0,
  baking: {
    kind: "tactile-v1",
    recipeId: "moon",
    stage: "result",
    shaped: 0,
    heat: 0,
    bakeRating: null,
    marks: [],
    assisted: false,
    legacyScore: 2,
  },
});
await resultStars(2);
const old = await state();
await page.getByRole("button", { name: "Collect payment" }).click();
expect((await state()).money - old.money).toBe(20);
// Locked recipes stay visible in the recipe book.
await page.getByRole("button", { name: "Recipe book", exact: true }).click();
await expect(page.locator(".recipe-card.locked")).toHaveCount(3);
await page.keyboard.press("Escape");
// Native touch follows the complete spiral, including lifting and tapping a control afterwards.
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
const mobile = await context.newPage();
await mobile.clock.install();
mobile.on("pageerror", (e) => errors.push(e.message));
await mobile.goto(process.env.GAME_URL ?? "http://localhost:5173");
await mobile.getByRole("button", { name: "Begin a new story" }).tap();
for (let i = 0; i < 2; i++)
  await mobile.getByRole("button", { name: /Continue/ }).tap();
await mobile.getByRole("button", { name: /Tie on your apron/ }).tap();
await mobile.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
  localStorage.setItem(
    "netherworld-save-v1",
    JSON.stringify({
      ...s,
      day: 2,
      orders: 1,
      level: 4,
      workStarted: true,
      scene: { ...s.scene, room: false },
    }),
  );
});
await mobile.reload();
await mobile.getByRole("button", { name: "Let’s get baking" }).tap();
await mobile.getByRole("button", { name: "Start baking" }).tap();
const canvas = mobile.getByRole("img", { name: "Spiral icing board" });
await canvas.scrollIntoViewIfNeeded();
box = await canvas.boundingBox();
const cdp = await context.newCDPSession(mobile);
const native = (p) => ({
  x: box.x + (box.width * p[0]) / 800,
  y: box.y + (box.height * p[1]) / 460,
});
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [native(path[0])],
});
for (const p of path)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [native(p)],
  });
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await mobile.getByRole("button", { name: "Bake my roll" }).tap();
await expect(mobile.getByLabel("3 of 3 quality stars")).toBeVisible();
expect(
  await mobile.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  ),
).toBe(false);
await mobile.screenshot({
  path: "artifacts/pastry-mobile.png",
  fullPage: true,
});
async function mobileSeed(patch) {
  await mobile.evaluate((p) => {
    const s = JSON.parse(localStorage.getItem("netherworld-save-v1"));
    localStorage.setItem(
      "netherworld-save-v1",
      JSON.stringify({
        ...s,
        baking: null,
        phase: "work",
        started: true,
        workStarted: true,
        scene: {
          screen: "home",
          room: false,
          visit: null,
          talk: null,
          beat: 0,
          intro: null,
        },
        ...p,
      }),
    );
  }, patch);
  await mobile.reload();
  await mobile.getByRole("button", { name: "Let’s get baking" }).tap();
}
await mobileSeed({ level: 1, day: 1, orders: 0 });
await mobile.getByRole("button", { name: "Start baking", exact: true }).tap();
await mobile.clock.runFor(1400);
for (let i = 0; i < 6; i++) {
  if (i) {
    const elapsed = await mobile.evaluate(
      () =>
        JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.elapsed,
    );
    await mobile.clock.runFor(Math.max(0, 1400 + i * 1050 - elapsed));
  }
  await mobile.getByRole("button", { name: /Knead dough/ }).tap();
}
await expect(mobile.getByLabel("3 of 3 quality stars")).toBeVisible();
await mobileSeed({ level: 2, day: 1, orders: 1 });
await mobile.getByRole("button", { name: "Start baking" }).tap();
const left = mobile.getByRole("button", { name: /^Left curl/ });
await left.scrollIntoViewIfNeeded();
const leftBox = await left.boundingBox();
const puzzleBox = await mobile
  .getByRole("img", { name: "Crescent puzzle board" })
  .boundingBox();
const dragStart = {
  x: leftBox.x + leftBox.width / 2,
  y: leftBox.y + leftBox.height / 2,
};
const dragEnd = {
  x: puzzleBox.x + (puzzleBox.width * 225) / 800,
  y: puzzleBox.y + (puzzleBox.height * 225) / 460,
};
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [dragStart],
});
for (let i = 1; i <= 12; i++)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      {
        x: dragStart.x + ((dragEnd.x - dragStart.x) * i) / 12,
        y: dragStart.y + ((dragEnd.y - dragStart.y) * i) / 12,
      },
    ],
  });
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
expect(
  await mobile.evaluate(
    () =>
      JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.tiles[0],
  ),
).toBe(0);
for (let i = 0; i < 2; i++)
  await mobile.getByRole("button", { name: /^Rotate left curl/ }).tap();
expect(
  await mobile.evaluate(
    () =>
      JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.turns[0],
  ),
).toBe(3);
await mobileSeed({ level: 3, day: 2, orders: 0 });
await mobile.getByRole("checkbox", { name: "Helping hand" }).check();
await mobile.getByRole("button", { name: "Start baking", exact: true }).tap();
await mobile.clock.runFor(4200);
const hints = await mobile.locator(".memory-pattern > span").allTextContents();
for (const hint of hints)
  await mobile
    .getByRole("button", { name: hint.replace(/^\d+\. /, ""), exact: true })
    .tap();
await expect(mobile.getByLabel("3 of 3 quality stars")).toBeVisible();
await context.close();
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: rhythm pause/resume, puzzle dragging/rotation/undo, observed memory sequence, direct mouse/touch spiral, recipe unlocks, sampler persistence and single payout, and old-save migration.",
);
await browser.close();
