import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

/** Build a real PDF buffer (usable as a file fixture). */
async function makePdfBuffer(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.addPage([400, 600]);
  doc.addPage([400, 600]);
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function waitForSw(page: import("@playwright/test").Page) {
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => {
      // Let the active worker claim the page.
      return navigator.serviceWorker.controller
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => resolve(),
              { once: true },
            );
          });
    }),
  );
}

test("merge tool merges two PDFs and offers a download", async ({ page }) => {
  await page.goto("/tools/merge-pdf");

  await expect(
    page.getByRole("heading", { name: "Merge PDFs" }),
  ).toBeVisible();

  const pdfA = await makePdfBuffer();
  const pdfB = await makePdfBuffer();

  // Upload two PDFs through the dropzone input.
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: pdfA },
    { name: "second.pdf", mimeType: "application/pdf", buffer: pdfB },
  ]);

  // Both files should be listed.
  await expect(page.getByText("first.pdf")).toBeVisible();
  await expect(page.getByText("second.pdf")).toBeVisible();

  // Wait for the SW to be ready before merging.
  await waitForSw(page);

  await page.getByRole("button", { name: "Merge PDFs" }).click();

  // Success banner + download link appear.
  await expect(page.getByText("Success!")).toBeVisible({ timeout: 15000 });
  const downloadLink = page.getByRole("link", { name: "Download merged PDF" });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute("download", /first\+second\.pdf/);
});

test("merge tool shows the drop region on load", async ({ page }) => {
  await page.goto("/tools/merge-pdf");
  await expect(
    page.getByText("Drag & drop PDF files here"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Choose PDF files" }),
  ).toBeVisible();
});