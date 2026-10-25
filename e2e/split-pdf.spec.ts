import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

async function makePdfBuffer(pageCount: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function waitForSw(page: import("@playwright/test").Page) {
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() =>
      navigator.serviceWorker.controller
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => resolve(),
              { once: true },
            );
          }),
    ),
  );
}

test("split tool splits a PDF by range and lists outputs", async ({ page }) => {
  await page.goto("/tools/split-pdf");

  await expect(
    page.getByRole("heading", { name: "Split PDF" }),
  ).toBeVisible();

  const pdf = await makePdfBuffer(6);
  await page.locator('input[type="file"]').setInputFiles({
    name: "doc.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });

  await page.getByRole("textbox", { name: /Page ranges/ }).fill("1-2,5");
  await waitForSw(page);
  await page.getByRole("button", { name: "Split PDF" }).click();

  await expect(
    page.getByText(/Split into 2 files/),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("link", { name: "Download" }).first(),
  ).toBeVisible();
});

test("split tool splits every N pages", async ({ page }) => {
  await page.goto("/tools/split-pdf");

  const pdf = await makePdfBuffer(7);
  await page.locator('input[type="file"]').setInputFiles({
    name: "doc.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });

  await page.getByRole("button", { name: "Advanced" }).click();
  await page.getByRole("button", { name: "Every N Pages" }).click();
  await page.getByRole("spinbutton", { name: /Pages per split/ }).fill("2");
  await waitForSw(page);
  await page.getByRole("button", { name: "Split PDF" }).click();

  await expect(
    page.getByText(/Split into 4 files/),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("link", { name: "Download" }).first(),
  ).toBeVisible();
});

test("split tool shows the drop region on load", async ({ page }) => {
  await page.goto("/tools/split-pdf");
  await expect(
    page.getByText("Drag & drop a PDF file here"),
  ).toBeVisible();
});