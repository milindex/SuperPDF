import { PDFDocument } from "pdf-lib";
import type { CropPdfPayload } from "@/lib/sw-contract";

/**
 * Crop every page by removing margins given as percentages (0–100) of each
 * side. Uses the page's MediaBox to compute the new visible area.
 */
export async function cropPdf(
  buffer: ArrayBuffer,
  topPct: number,
  rightPct: number,
  bottomPct: number,
  leftPct: number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);

  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const trimLeft = (leftPct / 100) * width;
    const trimRight = (rightPct / 100) * width;
    const trimTop = (topPct / 100) * height;
    const trimBottom = (bottomPct / 100) * height;

    const newWidth = width - trimLeft - trimRight;
    const newHeight = height - trimTop - trimBottom;
    if (newWidth <= 0 || newHeight <= 0) return;

    page.setCropBox(trimLeft, trimBottom, newWidth, newHeight);
  });

  return pdf.save();
}

export type { CropPdfPayload };