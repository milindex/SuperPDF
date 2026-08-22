import { PDFDocument } from "pdf-lib";
import type { OrganizePagesPayload } from "@/lib/sw-contract";

/**
 * Reorder (and/or remove) pages across one or more PDFs.
 * `buffers[0]` is the primary document; subsequent buffers are appended as
 * extra pages. `newOrder` is a list of 0-based *global* page indices
 * describing the desired final order; pages not listed are removed.
 * Global index = pages of buffer[0], then pages of buffer[1], and so on.
 */
export async function organizePages(
  buffers: ArrayBuffer[],
  newOrder: number[],
): Promise<Uint8Array> {
  const docs = await Promise.all(buffers.map((b) => PDFDocument.load(b)));
  const globalCount = docs.reduce((n, d) => n + d.getPageCount(), 0);

  const valid = newOrder.filter((idx) => idx >= 0 && idx < globalCount);
  if (valid.length === 0) {
    throw new Error("No pages in the new order.");
  }

  const newPdf = await PDFDocument.create();

  for (const globalIdx of valid) {
    let cursor = 0;
    let source: PDFDocument | null = null;
    let pageIdx = globalIdx;
    for (const doc of docs) {
      const count = doc.getPageCount();
      if (globalIdx < cursor + count) {
        source = doc;
        pageIdx = globalIdx - cursor;
        break;
      }
      cursor += count;
    }
    if (!source) continue;

    const [copied] = await newPdf.copyPages(source, [pageIdx]);
    newPdf.addPage(copied);
  }

  return newPdf.save();
}

export type { OrganizePagesPayload };