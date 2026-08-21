import { PDFDocument } from "pdf-lib";
import type { MergePdfPayload } from "@/lib/sw-contract";

/**
 * Merge multiple PDF documents into a single PDF containing all pages in the
 * order the buffers were provided.
 *
 * @param buffers Array of PDF file buffers to merge.
 * @returns Bytes of the merged PDF.
 */
export async function mergePdfs(buffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return mergedPdf.save();
}

export type { MergePdfPayload };
