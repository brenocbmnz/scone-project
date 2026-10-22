import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Begin a new story" }).click();
for (let i = 0; i < 3; i++) await page.keyboard.press("1");
await page
  .getByRole("button", { name: "Start work day at cash register" })
  .click();
await page.getByRole("button", { name: "Let’s get baking" }).click();
const getState = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("netherworld-save-v1")));
const board = page.getByRole("img", { name: "Dough shaping work surface" });
async function drag(from, to) {
  const box = await board.boundingBox();
  await page.mouse.move(
    box.x + (box.width * from.x) / 800,
    box.y + (box.height * from.y) / 460,
  );
  await page.mouse.down();
  await page.mouse.move(
    box.x + (box.width * to.x) / 800,
    box.y + (box.height * to.y) / 460,
    { steps: 10 },
  );
  await page.mouse.up();
}
// A click or wrong-way gesture does not complete shaping.
await drag({ x: 400, y: 320 }, { x: 400, y: 325 });
expect((await getState()).baking.shaped).toBe(0);
await drag({ x: 400, y: 320 }, { x: 400, y: 170 });
expect((await getState()).baking.shaped).toBe(1);
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
expect((await getState()).baking.shaped).toBe(1);
await drag({ x: 235, y: 230 }, { x: 310, y: 310 });
await drag({ x: 565, y: 230 }, { x: 490, y: 310 });
expect((await getState()).baking.shaped).toBe(3);
await page.getByRole("button", { name: "Into the oven", exact: true }).click();
await page.getByRole("button", { name: "Start baking", exact: true }).click();
await page.waitForTimeout(700);
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
});
await expect(page.getByRole("button", { name: "Resume baking" })).toBeVisible();
await page.evaluate(() => {
  delete document.hidden;
});
const heat = (await getState()).baking.heat;
await page.waitForTimeout(400);
expect((await getState()).baking.heat).toBe(heat);
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await expect(page.getByRole("button", { name: "Resume baking" })).toBeVisible();
expect((await getState()).baking.heat).toBe(heat);
await page.getByRole("checkbox", { name: /Gentle oven/ }).check();
await page.getByRole("button", { name: "Resume baking" }).click();
await page
  .getByRole("button", { name: "Decorate section 1", exact: true })
  .waitFor();
expect((await getState()).baking.heat).toBe(70);
// Painting changes the pastry directly. Outside clicks do not add marks.
const surface = page.getByRole("img", {
  name: "Pastry decorating work surface",
});
let box = await surface.boundingBox();
await page.mouse.click(box.x + 10, box.y + 10);
expect((await getState()).baking.marks.length).toBe(0);
await page.mouse.move(
  box.x + (box.width * 240) / 800,
  box.y + (box.height * 248) / 460,
);
await page.mouse.down();
await page.mouse.move(
  box.x + (box.width * 430) / 800,
  box.y + (box.height * 325) / 460,
  { steps: 20 },
);
await page.mouse.up();
expect((await getState()).baking.marks.length).toBeGreaterThan(3);
await page.getByRole("button", { name: "Undo decoration" }).click();
await page.getByRole("button", { name: "Clear decorations" }).click();
expect((await getState()).baking.marks.length).toBe(0);
for (let i = 1; i <= 3; i++)
  await page
    .getByRole("button", { name: `Decorate section ${i}`, exact: true })
    .click();
await page
  .getByRole("button", { name: "Serve my pastry", exact: true })
  .click();
await expect(page.getByLabel("3 of 3 quality stars")).toBeVisible();
await page.reload();
await page.getByRole("button", { name: "Let’s get baking" }).click();
await expect(page.getByLabel("3 of 3 quality stars")).toBeVisible();
await page.screenshot({ path: "artifacts/tactile-baking-result.png" });
const before = await getState();
await page
  .getByRole("button", { name: "Collect payment", exact: true })
  .dblclick();
const after = await getState();
expect(after.money - before.money).toBe(24);
expect(after.orders).toBe(1);
expect(after.baking).toBeNull();
// Keyboard completion is equivalent; an early bake still pays and advances the day.
await page.getByRole("button", { name: "Let’s get baking" }).click();
for (let i = 0; i < 3; i++) {
  await page.locator(".baking-main-action").focus();
  await page.keyboard.press("Enter");
}
await page.getByRole("button", { name: "Into the oven" }).click();
await page.getByRole("button", { name: "Start baking", exact: true }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Take pastry out" }).click();
await page.getByRole("button", { name: "Serve my pastry" }).click();
await expect(page.getByLabel("1 of 3 quality stars")).toBeVisible();
await page.getByRole("button", { name: "Collect payment" }).click();
expect((await getState()).phase).toBe("free");
// Every recipe's preparation and decorated result is playable, including day-two recipes.
for (const [orders, recipeName] of [
  [0, "Ghostlight Tart"],
  [1, "Cinnamon Roll"],
]) {
  await page.evaluate((orders) => {
    const save = JSON.parse(localStorage.getItem("netherworld-save-v1"));
    localStorage.setItem(
      "netherworld-save-v1",
      JSON.stringify({
        ...save,
        day: 2,
        orders,
        phase: "work",
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
  }, orders);
  await page.reload();
  await page.getByRole("button", { name: "Let’s get baking" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: recipeName, exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) await page.locator(".baking-main-action").click();
  await page.getByRole("button", { name: "Into the oven" }).click();
  await page.getByRole("checkbox", { name: /Gentle oven/ }).check();
  await page.getByRole("button", { name: "Start baking", exact: true }).click();
  await page
    .getByRole("button", { name: "Decorate section 1", exact: true })
    .waitFor();
  for (let i = 1; i <= 3; i++)
    await page
      .getByRole("button", { name: `Decorate section ${i}`, exact: true })
      .click();
  await page.getByRole("button", { name: "Serve my pastry" }).click();
  await expect(page.getByLabel("3 of 3 quality stars")).toBeVisible();
  if (orders === 1)
    await page.screenshot({ path: "artifacts/tactile-cinnamon-roll.png" });
}
// Native touch shaping/decorating on a narrow viewport.
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
const touch = await mobile.newPage();
touch.on("pageerror", (e) => errors.push(e.message));
await touch.goto(process.env.GAME_URL ?? "http://localhost:5173");
await touch.getByRole("button", { name: "Begin a new story" }).tap();
for (let i = 0; i < 2; i++)
  await touch.getByRole("button", { name: /Continue/ }).tap();
await touch.getByRole("button", { name: /Tie on your apron/ }).tap();
await touch
  .getByRole("button", { name: "Start work day at cash register" })
  .tap();
await touch.getByRole("button", { name: "Let’s get baking" }).tap();
const cdp = await mobile.newCDPSession(touch);
box = await touch
  .getByRole("img", { name: "Dough shaping work surface" })
  .boundingBox();
const a = { x: box.x + box.width * 0.5, y: box.y + (box.height * 320) / 460 };
const z = { x: a.x, y: box.y + (box.height * 170) / 460 };
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [a],
});
for (let i = 1; i <= 8; i++)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: a.x, y: a.y + ((z.y - a.y) * i) / 8 }],
  });
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
expect(
  await touch.evaluate(
    () => JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.shaped,
  ),
).toBe(1);
await touch.getByRole("button", { name: /Curl left tip/ }).tap();
await expect(
  touch.getByRole("button", { name: /Curl right tip/ }),
).toBeVisible();
await touch.getByRole("button", { name: /Curl right tip/ }).tap();
await expect(
  touch.getByRole("button", { name: "Into the oven" }),
).toBeVisible();
await touch.getByRole("button", { name: "Into the oven" }).tap();
await touch.getByRole("checkbox", { name: /Gentle oven/ }).check();
await touch.getByRole("button", { name: "Start baking", exact: true }).tap();
await touch
  .getByRole("button", { name: "Decorate section 1", exact: true })
  .waitFor();
const paintBoard = touch.getByRole("img", {
  name: "Pastry decorating work surface",
});
await paintBoard.scrollIntoViewIfNeeded();
box = await paintBoard.boundingBox();
const paintStart = {
  x: box.x + (box.width * 255) / 800,
  y: box.y + (box.height * 245) / 460,
};
const paintEnd = {
  x: box.x + (box.width * 410) / 800,
  y: box.y + (box.height * 320) / 460,
};
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [paintStart],
});
for (let i = 1; i <= 14; i++)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      {
        x: paintStart.x + ((paintEnd.x - paintStart.x) * i) / 14,
        y: paintStart.y + ((paintEnd.y - paintStart.y) * i) / 14,
      },
    ],
  });
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
expect(
  await touch.evaluate(
    () =>
      JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.marks
        .length,
  ),
).toBeGreaterThan(3);
await touch.screenshot({
  path: "artifacts/tactile-baking-mobile.png",
  fullPage: true,
});
expect(
  await touch.evaluate(() => document.documentElement.scrollWidth > innerWidth),
).toBe(false);
await mobile.close();
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: tactile mouse/touch shaping, wrong gestures, paint/undo/clear, oven pause/resume, assisted baking, result persistence, equal keyboard scoring, single payout and day progression.",
);
await browser.close();
