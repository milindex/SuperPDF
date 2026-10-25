"use client";

import { dataUrlToBytes, loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

/**
 * OCR a scanned PDF: each page is rendered to an image, recognized by
 * tesseract.js, and the recognized text is returned (pages separated by form
 * feeds). Fully client-side — the tesseract engine runs in the browser.
 */
export async function ocrPdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void,
): Promise<string> {
  const pdf = await loadPdf(buffer);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  try {
    const parts: string[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      onProgress?.(n, pdf.pageCount);
      const { dataUrl } = await renderPageToDataUrl(pdf, n, 2, "image/png");
      const pngBytes = dataUrlToBytes(dataUrl);
      const { data } = await worker.recognize(
        new Blob([pngBytes as Uint8Array<ArrayBuffer>], { type: "image/png" }),
      );
      parts.push(`=== Page ${n} ===\n${(data.text ?? "").trim()}`);
    }
    return parts.join("\n\n");
  } finally {
    await worker.terminate();
    pdf.destroy();
  }
}