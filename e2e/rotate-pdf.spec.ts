import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

async function makePdfBuffer(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.addPage([400, 600]);
  doc.addPage([400, 600]);
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

test("rotate tool rotates a PDF and offers a download", async ({ page }) => {
  await page.goto("/tools/rotate-pdf");

  await expect(
    page.getByRole("heading", { name: "Rotate PDF" }),
  ).toBeVisible();

  const pdf = await makePdfBuffer();
  await page.locator('input[type="file"]').setInputFiles({
    name: "doc.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });

  // Pick a rotation angle.
  await page.getByRole("button", { name: "180°" }).click();

  await waitForSw(page);
  await page.getByRole("button", { name: "Rotate PDF" }).click();

  await expect(page.getByText("Success!")).toBeVisible({ timeout: 15000 });
  const downloadLink = page.getByRole("link", { name: "Download PDF" });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute("download", /doc_rotated\.pdf/);
});

test("rotate tool shows the drop region on load", async ({ page }) => {
  await page.goto("/tools/rotate-pdf");
  await expect(
    page.getByText("Drag & drop a PDF file here"),
  ).toBeVisible();
});