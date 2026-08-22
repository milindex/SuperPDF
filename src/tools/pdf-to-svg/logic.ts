"use client";

import { loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

/**
 * Convert a PDF to an SVG per page. Each page's rendered raster content is
 * embedded as an image element in an SVG wrapper so the result opens as a
 * vector container. Fully client-side.
 */
export async function pdfToSvg(buffer: ArrayBuffer): Promise<Uint8Array[]> {
  const pdf = await loadPdf(buffer);
  try {
    const out: Uint8Array[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const { dataUrl, width, height } = await renderPageToDataUrl(pdf, n, 2, "image/png");
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image xlink:href="${dataUrl}" width="${width}" height="${height}"/>
</svg>`;
      out.push(new TextEncoder().encode(svg));
    }
    return out;
  } finally {
    pdf.destroy();
  }
}