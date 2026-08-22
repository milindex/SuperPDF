"use client";

import { PDFDocument } from "pdf-lib";
import { dataUrlToBytes, loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

/**
 * Compress a PDF by rendering each page to a JPEG and rebuilding the document.
 * Image-heavy PDFs shrink substantially; text-only PDFs gain little. The result
 * is rasterized (text becomes non-selectable). Fully client-side.
 *
 * `quality` is the JPEG quality (0–1); `scale` reduces resolution (1 = full,
 * 0.5 = half) for stronger compression.
 */
export async function compressPdf(
  buffer: ArrayBuffer,
  quality = 0.7,
  scale = 1,
): Promise<Uint8Array> {
  const pdf = await loadPdf(buffer);
  try {
    const out = await PDFDocument.create();
    for (let n = 1; n <= pdf.pageCount; n++) {
      const { dataUrl, width, height } = await renderPageToDataUrl(
        pdf,
        n,
        scale,
        "image/jpeg",
        quality,
      );
      const jpg = await out.embedJpg(dataUrlToBytes(dataUrl));
      const page = out.addPage([width, height]);
      page.drawImage(jpg, { x: 0, y: 0, width, height });
    }
    return out.save({ useObjectStreams: true });
  } finally {
    pdf.destroy();
  }
}