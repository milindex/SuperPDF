import { test, expect } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function makePdfBuffer(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 600]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("Hello SuperPDF", { x: 50, y: 550, size: 18, font });
  page.drawText("Some body text here.", { x: 50, y: 520, size: 12, font });
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

test("converts a PDF with a text layer to Markdown", async ({ page }) => {
  await page.goto("/tools/pdf-to-markdown");

  await expect(
    page.getByRole("heading", { name: "PDF to Markdown" }),
  ).toBeVisible();

  const pdf = await makePdfBuffer();
  await page.locator('input[type="file"]').setInputFiles({
    name: "doc.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });

  await page.getByRole("button", { name: "Convert to Markdown" }).click();

  await expect(
    page.getByText("Your document is ready to download."),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("link", { name: "Download PDF" }),
  ).toHaveAttribute("download", /\.md$/);
});