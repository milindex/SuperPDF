import { PDFDocument } from "pdf-lib";
import type { EditMetadataPayload } from "@/lib/sw-contract";

/**
 * Update document metadata fields. Only provided, non-empty values are set;
 * empty strings clear a field.
 */
export async function editMetadata(
  buffer: ArrayBuffer,
  fields: Omit<EditMetadataPayload, "buffer">,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);

  if (fields.title !== undefined) pdf.setTitle(fields.title);
  if (fields.author !== undefined) pdf.setAuthor(fields.author);
  if (fields.subject !== undefined) pdf.setSubject(fields.subject);
  if (fields.keywords !== undefined) {
    pdf.setKeywords(
      fields.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    );
  }

  return pdf.save();
}

export type { EditMetadataPayload };