import { PDFDocument, degrees } from "pdf-lib";
import type { RotatePdfPayload } from "@/lib/sw-contract";

/**
 * Rotate PDF pages by the given degrees. `pageRotations` maps page index
 * (0-based) → degrees to add (typically 90/180/270).
 */
export async function rotatePdf(
  buffer: ArrayBuffer | Uint8Array,
  pageRotations: Record<number, number>,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();

  Object.entries(pageRotations).forEach(([pageIndexStr, rotationToAdd]) => {
    const idx = parseInt(pageIndexStr, 10);
    if (idx >= 0 && idx < pages.length) {
      const page = pages[idx];
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + rotationToAdd) % 360;
      page.setRotation(degrees(newRotation));
    }
  });

  return pdf.save();
}

/**
 * Rotate all pages of a document by the given degrees.
 */
export async function rotateAllPages(
  buffer: ArrayBuffer | Uint8Array,
  rotationToAdd: number,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();
  const rotations: Record<number, number> = {};
  pages.forEach((_, idx) => {
    rotations[idx] = rotationToAdd;
  });
  return rotatePdf(buffer, rotations);
}

export type { RotatePdfPayload };