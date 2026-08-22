import { PDFDocument } from "pdf-lib";
import type { SignPdfPayload } from "@/lib/sw-contract";

/**
 * Add a signature image to a page. The image is placed at the bottom-right
 * corner, scaled to `width` points (default 120) with a 32pt margin.
 */
export async function signPdf(
  buffer: ArrayBuffer,
  signatureImage: Uint8Array,
  pageIndex = 0,
  width = 120,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const page = pdf.getPage(pageIndex);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const pngImage = await pdf.embedPng(signatureImage);
  const aspect = pngImage.height / pngImage.width;
  const imgWidth = Math.min(width, pageWidth - 64);
  const imgHeight = imgWidth * aspect;
  const margin = 32;

  page.drawImage(pngImage, {
    x: pageWidth - imgWidth - margin,
    y: margin,
    width: imgWidth,
    height: imgHeight,
  });

  return pdf.save();
}

export type { SignPdfPayload };