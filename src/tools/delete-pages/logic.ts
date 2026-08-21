import { PDFDocument } from "pdf-lib";
import type { DeletePagesPayload } from "@/lib/sw-contract";

/**
 * Delete pages from a PDF. `pageIndices` are 0-based indices; out-of-range
 * and negative indices are ignored.
 */
export async function deletePages(
  buffer: ArrayBuffer,
  pageIndices: number[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);

  const sortedToDelete = Array.from(pageIndices).sort((a, b) => b - a);

  sortedToDelete.forEach((idx) => {
    if (idx >= 0 && idx < pdf.getPageCount()) {
      pdf.removePage(idx);
    }
  });

  return pdf.save();
}

export type { DeletePagesPayload };