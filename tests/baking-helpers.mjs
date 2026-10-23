export async function finishPastry(page) {
  await page
    .getByRole("button", { name: "Start kneading", exact: true })
    .click();
  for (let i = 0; i < 6; i++) {
    await page
      .locator(".signature-board")
      .getByText("KNEAD!", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: /Knead dough/ }).click();
  }
  await page
    .getByRole("button", { name: "Collect payment", exact: true })
    .click();
}
