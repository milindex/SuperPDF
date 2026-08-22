import { PDFDocument } from "pdf-lib";
import type { ExtractPagesPayload } from "@/lib/sw-contract";

/**
 * Extract specific pages from a PDF into a new document. `pageIndices` are
 * 0-based and preserved in the order given; out-of-range and negative
 * indices are ignored.
 */
export async function extractPages(
  buffer: ArrayBuffer,
  pageIndices: number[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const pageCount = pdf.getPageCount();

  const valid = pageIndices.filter((idx) => idx >= 0 && idx < pageCount);
  if (valid.length === 0) {
    throw new Error("No valid pages to extract.");
  }

  const newPdf = await PDFDocument.create();
  const copied = await newPdf.copyPages(pdf, valid);
  copied.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

export type { ExtractPagesPayload };