const clocks = new WeakSet();
export async function finishPastry(page) {
  if (!clocks.has(page)) {
    await page.clock.install();
    clocks.add(page);
  }
  await page.getByRole("button", { name: "Start baking", exact: true }).click();
  for (let i = 0; i < 6; i++) {
    const elapsed = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("netherworld-save-v1")).baking.elapsed,
    );
    await page.clock.runFor(Math.max(0, 1400 + i * 1050 - elapsed));
    await page.getByRole("button", { name: /Knead dough/ }).click();
  }
  await page
    .getByRole("button", { name: "Collect payment", exact: true })
    .click();
}
