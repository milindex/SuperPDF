"use client";

import { dataUrlToBytes, loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

export interface RenderedImage {
  bytes: Uint8Array;
  name: string;
  width: number;
  height: number;
}

/**
 * Render every page of a PDF to a PNG image, fully client-side.
 */
export async function pdfToPng(
  buffer: ArrayBuffer,
  scale = 2,
): Promise<RenderedImage[]> {
  const pdf = await loadPdf(buffer);
  try {
    const out: RenderedImage[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const { dataUrl, width, height } = await renderPageToDataUrl(
        pdf,
        n,
        scale,
        "image/png",
      );
      out.push({
        bytes: dataUrlToBytes(dataUrl),
        name: `page-${n}.png`,
        width,
        height,
      });
    }
    return out;
  } finally {
    pdf.destroy();
  }
}