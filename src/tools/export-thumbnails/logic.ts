"use client";

import { loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

export type ThumbnailFormat = "png" | "jpeg";

export async function exportThumbnails(
  buffer: ArrayBuffer,
  format: ThumbnailFormat,
  scale: number,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const pdf = await loadPdf(buffer);
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const extension = format === "png" ? "png" : "jpg";
  const padding = String(pdf.pageCount).length;

  try {
    for (let page = 1; page <= pdf.pageCount; page += 1) {
      const { dataUrl } = await renderPageToDataUrl(
        pdf,
        page,
        scale,
        mime,
        0.9,
      );
      const name = `page-${String(page).padStart(padding, "0")}.${extension}`;
      zip.file(name, dataUrl.split(",")[1], { base64: true });
      onProgress?.(Math.round((page / pdf.pageCount) * 90));
    }
  } finally {
    pdf.destroy();
  }

  onProgress?.(95);
  const blob = await zip.generateAsync({ type: "blob" });
  onProgress?.(100);
  return blob;
}
