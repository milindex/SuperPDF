import { PDFDocument } from "pdf-lib";
import type { FlattenPdfPayload } from "@/lib/sw-contract";

/**
 * Flatten a PDF: every page's content is re-embedded into a fresh document,
 * which drops interactive elements such as annotations, links, and form
 * fields, producing a single static layer. The appearance of the content
 * itself is preserved as rendered.
 */
export async function flattenPdf(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();

  const copied = await newPdf.copyPages(pdf, pdf.getPageIndices());
  copied.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

export type { FlattenPdfPayload };