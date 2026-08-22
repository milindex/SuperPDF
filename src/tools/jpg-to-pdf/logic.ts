"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

/**
 * Convert JPG images into a PDF, one page per image. Fully client-side.
 */
export async function jpgToPdf(files: File[]): Promise<Uint8Array> {
  const images = await Promise.all(
    files.map(async (f) => ({
      bytes: new Uint8Array(await f.arrayBuffer()),
      kind: "jpg" as const,
    })),
  );
  return imagesToPdf(images);
}