import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
const port = 4175;
const url = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  { stdio: "inherit" },
);
let serverExited = false;
server.on("exit", () => {
  serverExited = true;
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (serverExited) throw new Error("Test server exited before startup");
    try {
      const response = await fetch(url);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  if (!ready) throw new Error("Test server did not become ready");
  for (const script of [
    "smoke",
    "routes",
    "novel",
    "room",
    "stacking",
    "dragging",
    "presentation",
  ]) {
    const child = spawn(process.execPath, [`tests/${script}.mjs`], {
      stdio: "inherit",
      env: { ...process.env, GAME_URL: url },
    });
    const code = await new Promise((resolve, reject) => {
      child.on("exit", resolve);
      child.on("error", reject);
    });
    if (code !== 0) throw new Error(`${script} browser checks failed`);
  }
} finally {
  server.kill("SIGTERM");
}
