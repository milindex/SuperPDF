"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

async function svgToPngBytes(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`"${file.name}" is not a valid SVG.`));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    return new Uint8Array(atob(base64).split("").map((c) => c.charCodeAt(0)));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convert SVG images into a PDF (rasterized to PNG first). One page per
 * image, fully client-side.
 */
export async function svgToPdf(files: File[]): Promise<Uint8Array> {
  const images = await Promise.all(
    files.map(async (f) => ({
      bytes: await svgToPngBytes(f),
      kind: "png" as const,
    })),
  );
  return imagesToPdf(images);
}