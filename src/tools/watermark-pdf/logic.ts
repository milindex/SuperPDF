import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import type { WatermarkPdfPayload } from "@/lib/sw-contract";

/**
 * Stamp text diagonally across the center of every page.
 * `fontSize` defaults to ~12% of page width; `opacity` defaults to 0.2.
 */
export async function watermarkPdf(
  buffer: ArrayBuffer,
  text: string,
  fontSize?: number,
  opacity?: number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = fontSize ?? Math.max(24, Math.round(width * 0.12));
    const textWidth = font.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2 - size / 2,
      size,
      font,
      color: rgb(0, 0, 0),
      opacity: opacity ?? 0.2,
      rotate: degrees(-30),
    });
  });

  return pdf.save();
}

export type { WatermarkPdfPayload };