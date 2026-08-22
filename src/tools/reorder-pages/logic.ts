import { PDFDocument } from "pdf-lib";
import type { ReorderPagesPayload } from "@/lib/sw-contract";

/**
 * Reorder the pages of a PDF. `newOrder` is a 0-based index array describing
 * the desired page order (e.g. [2,0,1] moves page 3 to the front).
 */
export async function reorderPages(
  buffer: ArrayBuffer,
  newOrder: number[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();

  const validOrder = newOrder.filter(
    (idx) => idx >= 0 && idx < pdf.getPageCount(),
  );

  const copiedPages = await newPdf.copyPages(pdf, validOrder);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

export type { ReorderPagesPayload };