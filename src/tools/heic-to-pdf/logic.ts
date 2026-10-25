"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

async function heicToPngBytes(file: File): Promise<Uint8Array> {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({
    blob: file,
    toType: "image/png",
  });
  const out = Array.isArray(blob) ? blob[0] : blob;
  return new Uint8Array(await out.arrayBuffer());
}

/**
 * Convert HEIC images into a PDF (decoded to PNG first). One page per image,
 * fully client-side via heic2any (libheif wasm).
 */
export async function heicToPdf(files: File[]): Promise<Uint8Array> {
  const images = await Promise.all(
    files.map(async (f) => ({
      bytes: await heicToPngBytes(f),
      kind: "png" as const,
    })),
  );
  return imagesToPdf(images);
}