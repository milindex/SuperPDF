"use client";

import { PDFDocument } from "pdf-lib";

export interface ImageInput {
  /** JPEG bytes for embedJpg, or raw raster bytes for embedPng. */
  bytes: Uint8Array;
  kind: "jpg" | "png";
}

/**
 * Build a PDF where each page is sized to a supplied image.
 * Uses pdf-lib's embedJpg / embedPng — no DOM dependency beyond the bytes.
 */
export async function imagesToPdf(images: ImageInput[]): Promise<Uint8Array> {
  if (images.length === 0) throw new Error("No images to convert.");
  const pdf = await PDFDocument.create();
  for (const img of images) {
    const pdfImage =
      img.kind === "jpg" ? await pdf.embedJpg(img.bytes) : await pdf.embedPng(img.bytes);
    const { width, height } = pdfImage.scale(1);
    const page = pdf.addPage([width, height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width, height });
  }
  return pdf.save();
}