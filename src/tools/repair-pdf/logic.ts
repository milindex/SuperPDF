import { PDFDocument, ParseSpeeds } from "pdf-lib";
import type { RepairPdfPayload } from "@/lib/sw-contract";

/**
 * Repair a corrupted PDF by re-parsing it leniently and re-saving it.
 * pdf-lib rebuilds the object graph, dropping dangling references, so the
 * result is a structurally valid document.
 */
export async function repairPdf(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer, {
    throwOnInvalidObject: false,
    parseSpeed: ParseSpeeds.Fastest,
    ignoreEncryption: true,
  });
  return pdf.save({ useObjectStreams: true });
}

export type { RepairPdfPayload };