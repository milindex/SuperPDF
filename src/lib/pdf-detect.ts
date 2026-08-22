import { PDFDocument } from "pdf-lib";

export type PdfDetectStatus =
  | { status: "ok"; pageCount: number; encrypted: boolean }
  | { status: "invalid"; error: string };

/**
 * Client-side detector for whether a PDF can be protected or unlocked in the
 * browser. pdf-lib can parse the document structure and report encryption, but
 * it cannot decrypt or encrypt streams — that is what these tools gate on.
 */
export async function detectPdf(buffer: ArrayBuffer): Promise<PdfDetectStatus> {
  try {
    const pdf = await PDFDocument.load(buffer);
    return { status: "ok", pageCount: pdf.getPageCount(), encrypted: pdf.isEncrypted };
  } catch {
    try {
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return { status: "ok", pageCount: 0, encrypted: true };
    } catch {
      return { status: "invalid", error: "This file is not a readable PDF." };
    }
  }
}