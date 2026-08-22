import { PDFDocument } from "pdf-lib";
import type { RemoveMetadataPayload } from "@/lib/sw-contract";

/**
 * Strip all document metadata from a PDF by clearing the Info dictionary.
 */
export async function removeMetadata(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);

  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("");
  pdf.setCreator("");

  return pdf.save();
}

export type { RemoveMetadataPayload };