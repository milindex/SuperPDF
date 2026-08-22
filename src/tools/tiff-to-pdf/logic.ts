"use client";

import * as UTIF from "utif";
import { imagesToPdf } from "@/lib/images-to-pdf";

function tiffToPngBytes(buffer: ArrayBuffer): Uint8Array {
  const ifds = UTIF.decode(buffer);
  if (ifds.length === 0) throw new Error("No images found in this TIFF.");
  const ifd = ifds[0];
  UTIF.decodeImage(buffer, ifd, ifds);
  const rgba = UTIF.toRGBA8(ifd);

  const width = ifd.width;
  const height = ifd.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const imageData = ctx.createImageData(width, height);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  return new Uint8Array(atob(base64).split("").map((c) => c.charCodeAt(0)));
}

/**
 * Convert TIFF images into a PDF (decoded to PNG first). One page per image,
 * fully client-side via utif.
 */
export async function tiffToPdf(files: File[]): Promise<Uint8Array> {
  const images = await Promise.all(
    files.map(async (f) => ({
      bytes: tiffToPngBytes(await f.arrayBuffer()),
      kind: "png" as const,
    })),
  );
  return imagesToPdf(images);
}