import { test, expect } from "@playwright/test";

test.describe("global shell", () => {
  test("renders header, footer, and hero on the homepage", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");

    // Header logo + nav
    await expect(
      header.getByRole("link", { name: "SuperPDF home" }),
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Split PDF" }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: /All PDF Tools/ }),
    ).toBeVisible();

    // Footer logo + links
    await expect(
      footer.getByRole("link", { name: "SuperPDF home" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Privacy Policy" }),
    ).toBeVisible();
  });

  test("opens the All PDF Tools mega menu and navigates", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    await header.getByRole("button", { name: /All PDF Tools/ }).hover();

    // Mega menu shows popular tools and category columns
    await expect(page.getByRole("heading", { name: "Popular" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "PDF to Word" }).first(),
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Protect PDF" }),
    ).toBeVisible();
  });
});

test.describe("homepage sections", () => {
  test("renders tools, hero, features, testimonials, FAQ, and CTA", async ({
    page,
  }) => {
    await page.goto("/");

    const toolsSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Powerful PDF Tools" }),
    });

    // Tools section
    await expect(
      page.getByRole("heading", { name: "Powerful PDF Tools" }),
    ).toBeVisible();
    await expect(
      toolsSection.getByRole("link", { name: /^Merge PDF/ }),
    ).toBeVisible();

    // Hero
    await expect(
      page.getByRole("heading", { name: "SuperPDF", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start Using Tools/ }),
    ).toBeVisible();

    // Features
    await expect(
      page.getByRole("heading", { name: "Why Choose SuperPDF?" }),
    ).toBeVisible();

    // Testimonials
    await expect(
      page.getByRole("heading", { name: "Trusted by Professionals" }),
    ).toBeVisible();

    // FAQ
    await expect(
      page.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeVisible();

    // CTA
    await expect(
      page.getByRole("heading", { name: /Ready to Transform Your PDFs/ }),
    ).toBeVisible();
  });

  test("filters tools by category on the homepage", async ({ page }) => {
    await page.goto("/");

    const toolsSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Powerful PDF Tools" }),
    });

    await page.getByRole("button", { name: "Security" }).click();

    await expect(
      toolsSection.getByRole("link", { name: /^Protect PDF/ }),
    ).toBeVisible();
    await expect(
      toolsSection.getByRole("link", { name: /^Unlock PDF/ }),
    ).toBeVisible();
    await expect(
      toolsSection.getByRole("link", { name: /^Merge PDF/ }),
    ).not.toBeVisible();
  });
});
