import { test, expect } from "@playwright/test";

test.describe("support page", () => {
  test("explains donations and links to Ko-fi", async ({ page }) => {
    await page.goto("/support");

    await expect(
      page.getByRole("heading", { name: "Support SuperPDF", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "A small budget, spent carefully." }),
    ).toBeVisible();

    const kofi = page
      .getByRole("link", { name: /Buy me a coffee/ })
      .first();
    await expect(kofi).toHaveAttribute("href", "https://ko-fi.com/D6N42AGXNQ");
    await expect(kofi).toHaveAttribute("target", "_blank");
  });

  test("is reachable from the footer", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Support us" })
      .click();

    await expect(page).toHaveURL(/\/support$/);
    await expect(
      page.getByRole("heading", { name: "Support SuperPDF", exact: true }),
    ).toBeVisible();
  });
});
