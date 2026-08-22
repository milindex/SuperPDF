"use client";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  workerConfigured = true;
}

/**
 * Load a PDF document client-side with pdf.js and render pages to canvas.
 * Returns a handle the caller must clean up with destroy().
 */
export async function loadPdf(buffer: ArrayBuffer) {
  ensureWorker();
  const doc = await getDocument({ data: buffer }).promise;
  return {
    pageCount: doc.numPages,
    destroy: () => doc.destroy(),
    getPage: (n: number) => doc.getPage(n),
  };
}

export type LoadedPdf = Awaited<ReturnType<typeof loadPdf>>;

/**
 * Render a page to a canvas and return its data URL.
 * `scale` controls resolution (1 = 72dpi equivalent; 2 is typical for export).
 */
export async function renderPageToDataUrl(
  pdf: LoadedPdf,
  pageNumber: number,
  scale = 2,
  format: "image/jpeg" | "image/png" = "image/png",
  quality?: number,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d", { alpha: format === "image/png" });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL(format, quality),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Convert a canvas data URL back to bytes for download.
 */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}