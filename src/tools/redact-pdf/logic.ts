import { PDFDocument, rgb } from "pdf-lib";
import type { RedactPdfPayload, RedactRegion } from "@/lib/sw-contract";

/**
 * Cover sensitive regions with solid black rectangles. Coordinates are
 * percentages (0–100) of the page size, measured from the top-left.
 * Redaction is destructive — the covered content cannot be recovered.
 */
export async function redactPdf(
  buffer: ArrayBuffer,
  regions: RedactRegion[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();

  for (const region of regions) {
    const page = pages[region.pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();

    const x = (region.xPct / 100) * width;
    const y = height - ((region.yPct + region.heightPct) / 100) * height;
    const w = (region.widthPct / 100) * width;
    const h = (region.heightPct / 100) * height;

    page.drawRectangle({ x, y, width: w, height: h, color: rgb(0, 0, 0) });
  }

  return pdf.save();
}

export type { RedactPdfPayload, RedactRegion };