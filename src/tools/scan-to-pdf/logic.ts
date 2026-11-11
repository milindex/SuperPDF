"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

export interface CapturedPage {
  bytes: Uint8Array;
  /** Dimensions in CSS pixels of the capture. */
  width: number;
  height: number;
}

/**
 * Capture a frame from the given video element and return it as PNG bytes.
 */
export async function captureFrame(
  video: HTMLVideoElement,
): Promise<CapturedPage> {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("Failed to capture frame.")),
      "image/png",
    );
  });

  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
  };
}

/**
 * Assemble captured pages into a single PDF.
 */
export async function pagesToPdf(pages: CapturedPage[]): Promise<Uint8Array> {
  return imagesToPdf(pages.map((p) => ({ bytes: p.bytes, kind: "png" as const })));
}