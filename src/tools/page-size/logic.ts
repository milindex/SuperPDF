import { PDFDocument } from "pdf-lib";
import type { PageSizePayload, PageSizePreset } from "@/lib/sw-contract";

export const PRESET_SIZES: Record<PageSizePreset, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  a5: { width: 419.53, height: 595.28 },
  legal: { width: 612, height: 1008 },
};

/**
 * Resize every page to a target width/height (in points), scaling content to
 * fit. Uses the MediaBox and scales the page contents proportionally.
 */
export async function resizePdf(
  buffer: ArrayBuffer,
  width: number,
  height: number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);

  pdf.getPages().forEach((page) => {
    const { width: origW, height: origH } = page.getSize();
    const scaleX = width / origW;
    const scaleY = height / origH;
    const scale = Math.min(scaleX, scaleY);

    page.setMediaBox(0, 0, width, height);
    page.scaleContent(scale, scale);
  });

  return pdf.save();
}

export type { PageSizePayload, PageSizePreset };