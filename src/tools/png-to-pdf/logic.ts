"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

/**
 * Convert PNG images into a PDF, one page per image. Fully client-side.
 */
export async function pngToPdf(files: File[]): Promise<Uint8Array> {
  const images = await Promise.all(
    files.map(async (f) => ({
      bytes: new Uint8Array(await f.arrayBuffer()),
      kind: "png" as const,
    })),
  );
  return imagesToPdf(images);
}