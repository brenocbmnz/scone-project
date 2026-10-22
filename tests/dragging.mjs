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
const boardBox = () => page.locator(".stack-board>svg").boundingBox();
async function dragMouse(locator, x, y) {
  const from = await locator.boundingBox(),
    board = await boardBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    board.x + (x / 800) * board.width,
    board.y + (y / 520) * board.height,
    { steps: 15 },
  );
  await expect(page.locator(".ingredient-in-hand")).toBeVisible();
  await page.mouse.up();
  await expect(page.locator(".ingredient-in-hand")).toHaveCount(0);
  await page.waitForFunction(() => {
    const s = JSON.parse(localStorage.getItem("netherworld-save-v1")).baking;
    return (
      s &&
      s.pieces.length &&
      !s.pieces.some((p) => p.status === "falling" || p.status === "sliding")
    );
  });
}
await dragMouse(
  page.getByRole("button", { name: "Pick Crescent", exact: true }),
  400,
  350,
);
await expect(page.locator(".stack-score>strong")).toHaveText("1 / 3");
if (
  (await state()).baking.pieces.length !== 1 ||
  (await state()).baking.pieces[0].y < 300
)
  throw new Error("Drag spawned an extra item or reset release height");
const bottom = await page.locator("[data-piece-id]").evaluate((el) => {
  const b = el.getBBox(),
    m = el.transform.baseVal.consolidate().matrix;
  return m.f + b.y + b.height;
});
if (Math.abs(bottom - 392) > 1)
  throw new Error(`Artwork floats above or sinks into plate: ${bottom}`);
// Cancel a drag outside the work surface without adding a piece.
await page.getByRole("tab", { name: "02 Fillings & icing" }).click();
let source = await page
  .getByRole("button", { name: "Pick Moonberry", exact: true })
  .boundingBox();
await page.mouse.move(
  source.x + source.width / 2,
  source.y + source.height / 2,
);
await page.mouse.down();
await page.mouse.move(50, 50, { steps: 8 });
await page.mouse.up();
if ((await state()).baking.pieces.length !== 1)
  throw new Error("Dropping outside the board added an ingredient");
// Escape cancels the gesture, not the cooking session, and releasing afterwards cannot place it.
source = await page
  .getByRole("button", { name: "Pick Moonberry", exact: true })
  .boundingBox();
const board = await boardBox();
await page.mouse.move(
  source.x + source.width / 2,
  source.y + source.height / 2,
);
await page.mouse.down();
await page.mouse.move(
  board.x + board.width / 2,
  board.y + board.height * 0.55,
  { steps: 10 },
);
await page.keyboard.press("Escape");
await expect(
  page.getByRole("dialog", { name: "At the workbench" }),
).toBeVisible();
await page.mouse.up();
if ((await state()).baking.pieces.length !== 1)
  throw new Error("Canceled drag placed an ingredient");
await dragMouse(
  page.getByRole("button", { name: "Pick Moonberry", exact: true }),
  400,
  318,
);
await expect(page.locator(".stack-score>strong")).toHaveText("2 / 3");
// Pick up the exposed filling and reposition it. The base remains in place.
const moved = (await state()).baking.pieces[1],
  bounds = await boardBox();
await page.mouse.move(
  bounds.x + (moved.x / 800) * bounds.width,
  bounds.y + (moved.y / 520) * bounds.height,
);
await page.mouse.down();
await page.mouse.move(
  bounds.x + (425 / 800) * bounds.width,
  bounds.y + (318 / 520) * bounds.height,
  { steps: 12 },
);
await page.mouse.up();
await page.waitForFunction(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1")).baking;
  return (
    s &&
    s.pieces.length &&
    !s.pieces.some((p) => p.status === "falling" || p.status === "sliding")
  );
});
if (
  (await state()).baking.pieces.length !== 2 ||
  Math.abs((await state()).baking.pieces[1].x - 425) > 2
)
  throw new Error("Repositioning duplicated or lost the filling");
await page.screenshot({ path: "artifacts/dragging-stack.png" });
await page.getByRole("button", { name: "Close At the workbench" }).click();
await page.reload();
await page.getByRole("button", { name: /Let’s get baking/ }).click();
await expect(page.locator(".stack-score>strong")).toHaveText("2 / 3");
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("tab", { name: "03 Toppings" }).click();
// Use native touch events, including pointer capture, rather than synthesizing a mouse drag.
const item = await page
    .getByRole("button", { name: "Pick Star sugar", exact: true })
    .boundingBox(),
  small = await boardBox();
const cdp = await page.context().newCDPSession(page);
const sx = item.x + item.width / 2,
  sy = item.y + item.height / 2,
  tx = small.x + (425 / 800) * small.width,
  ty = small.y + (270 / 520) * small.height;
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: sx, y: sy }],
});
for (let i = 1; i <= 12; i++)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: sx + ((tx - sx) * i) / 12, y: sy + ((ty - sy) * i) / 12 },
    ],
  });
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await page.waitForFunction(() => {
  const s = JSON.parse(localStorage.getItem("netherworld-save-v1")).baking;
  return (
    s &&
    s.pieces.length &&
    !s.pieces.some((p) => p.status === "falling" || p.status === "sliding")
  );
});
await expect(page.locator(".stack-score>strong")).toHaveText("3 / 3");
await page.screenshot({
  path: "artifacts/dragging-mobile.png",
  fullPage: true,
});
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw new Error("Mobile drag overflow");
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "PASS: mouse/touch drag, release-height placement, contour contact, outside/Escape cancellation, exposed-piece repositioning, save/resume and mobile play.",
);
await browser.close();
