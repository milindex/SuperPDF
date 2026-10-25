"use client";

import { imagesToPdf } from "@/lib/images-to-pdf";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("This file could not be read as a BMP image."));
    image.src = url;
  });
}

async function bmpToPng(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, image.naturalWidth);
    canvas.height = Math.max(1, image.naturalHeight);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported in this browser.");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("The image could not be converted.");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function bmpToPdf(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("Choose at least one BMP image.");
  const images = [];
  for (const file of files) {
    images.push({ bytes: await bmpToPng(file), kind: "png" as const });
  }
  return imagesToPdf(images);
}
