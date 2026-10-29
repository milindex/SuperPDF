import { test, expect } from "@playwright/test";

test.describe("global shell", () => {
  test("renders header, footer, and hero on the homepage", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");

    await expect(
      header.getByRole("link", { name: "SuperPDF home" }),
    ).toBeVisible();
    await expect(header.getByRole("link", { name: "Tools" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Workflow" })).toBeVisible();
    await expect(
      header.getByRole("button", { name: "Search tools" }),
    ).toBeVisible();

    await expect(
      footer.getByRole("link", { name: "SuperPDF home" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Privacy" }),
    ).toBeVisible();
  });

  test("opens search and finds a tool", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search tools" }).click();
    await page.getByLabel(/Search \d+ PDF tools/).fill("markdown");
    await expect(
      page
        .locator("#tool-search")
        .getByRole("link", { name: /^PDF to Markdown/ }),
    ).toBeVisible();
  });
});

test.describe("homepage sections", () => {
  test("renders the hero, tool finder, steps, FAQ, and closing CTA", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Your PDFs never leave this tab/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Find a tool" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Every tool, one place/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Three steps, and the file/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Common questions" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open the workbench" }).first(),
    ).toBeVisible();
  });

  test("filters tools by category on the homepage", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("group", { name: "Filter by category" })
      .getByRole("button", { name: "Security" })
      .click();

    await expect(
      page.getByRole("link", { name: /^Protect PDF/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^Unlock PDF/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^Merge PDF/ }),
    ).not.toBeVisible();
  });

  test("shows a recently used tool after visiting it", async ({ page }) => {
    await page.goto("/tools/merge-pdf");
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Recently used" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Tool.*Merge PDF/ }),
    ).toBeVisible();
  });
});

test.describe("workflow builder", () => {
  test("starts an example chain and lists its steps", async ({ page }) => {
    await page.goto("/workflow");

    await expect(
      page.getByRole("heading", { name: "Workflow" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Use the example chain" }).click();

    await expect(page.getByRole("heading", { name: "Compress" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Add page numbers" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watermark" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Run 3 steps" }),
    ).toBeDisabled();
  });
});
