// Optional controlled benchmark; timing numbers are observations, not flaky CI thresholds.
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {
    rate: Number(process.env.CPU_RATE ?? 4),
  });
  await cdp.send("Performance.enable");
  await page.addInitScript(() => {
    window.runtimeSample = { commits: 0, writes: 0, saveMs: 0, frames: [] };
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      inject(renderer) {
        this.renderers.set(1, renderer);
        return 1;
      },
      onCommitFiberRoot() {
        window.runtimeSample.commits++;
      },
      onCommitFiberUnmount() {},
    };
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) {
      const start = performance.now();
      const result = original.apply(this, args);
      window.runtimeSample.writes++;
      window.runtimeSample.saveMs += performance.now() - start;
      return result;
    };
  });
  await page.goto(process.env.GAME_URL ?? "http://localhost:5173");
  await page.getByRole("button", { name: "Begin a new story" }).click();
  for (let i = 0; i < 2; i++)
    await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Tie on your apron/ }).click();
  await page
    .getByRole("button", { name: "Start work day at cash register" })
    .click();
  await page.getByRole("button", { name: "Let’s get baking" }).click();
  await page
    .getByRole("button", { name: "Start kneading", exact: true })
    .click();
  const before = await cdp.send("Performance.getMetrics");
  await page.evaluate(() => {
    window.runtimeSample = {
      commits: 0,
      writes: 0,
      saveMs: 0,
      frames: [],
      started: performance.now(),
    };
    let previous = performance.now();
    const tick = (now) => {
      window.runtimeSample.frames.push(now - previous);
      previous = now;
      if (!window.runtimeSample.stopped) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.waitForTimeout(4500);
  const result = await page.evaluate(() => {
    const s = window.runtimeSample;
    s.stopped = true;
    const frames = [...s.frames].sort((a, b) => a - b);
    const seconds = (performance.now() - s.started) / 1000;
    return {
      seconds: Number(seconds.toFixed(2)),
      frames: frames.length,
      fps: Number((frames.length / seconds).toFixed(1)),
      p95FrameMs: Number(
        (frames[Math.floor(frames.length * 0.95)] ?? 0).toFixed(1),
      ),
      over50ms: frames.filter((n) => n > 50).length,
      reactCommits: s.commits,
      saveWrites: s.writes,
      saveMs: Number(s.saveMs.toFixed(1)),
    };
  });
  const after = await cdp.send("Performance.getMetrics");
  for (const name of ["ScriptDuration", "TaskDuration", "LayoutDuration"]) {
    const first = before.metrics.find((m) => m.name === name)?.value ?? 0;
    const last = after.metrics.find((m) => m.name === name)?.value ?? 0;
    result[name + "Ms"] = Math.round((last - first) * 1000);
  }
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
