export async function finishPastry(page) {
  for (let i = 0; i < 3; i++) await page.locator(".baking-main-action").click();
  await page
    .getByRole("button", { name: "Into the oven", exact: true })
    .click();
  await page.getByRole("checkbox", { name: /Gentle oven/ }).check();
  await page.getByRole("button", { name: "Start baking", exact: true }).click();
  await page
    .getByRole("button", { name: "Decorate section 1", exact: true })
    .waitFor();
  for (let i = 1; i <= 3; i++)
    await page
      .getByRole("button", { name: `Decorate section ${i}`, exact: true })
      .click();
  await page
    .getByRole("button", { name: "Serve my pastry", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Collect payment", exact: true })
    .click();
}
