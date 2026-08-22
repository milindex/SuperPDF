"use client";

import { OPS } from "pdfjs-dist";
import { loadPdf } from "@/lib/pdfjs";

export interface ExtractedImage {
  bytes: Uint8Array;
  name: string;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Extract images embedded in a PDF. Walks each page's operator list looking
 * for `paintImageXObject` ops and reads the referenced image object. Runs
 * fully client-side via pdf.js.
 */
export async function extractImages(
  buffer: ArrayBuffer,
): Promise<ExtractedImage[]> {
  const pdf = await loadPdf(buffer);
  const out: ExtractedImage[] = [];
  try {
    for (let n = 1; n <= pdf.pageCount; n++) {
      const page = await pdf.getPage(n);
      const opList = await page.getOperatorList();
      const objs = page.objs as unknown as {
        get: (name: string) => Promise<unknown>;
      };

      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) {
          continue;
        }
        const name = opList.argsArray[i][0] as string;
        try {
          const obj = (await objs.get(name)) as {
            bitmap?: HTMLCanvasElement | ImageBitmap;
            width?: number;
            height?: number;
            data?: Uint8Array;
          } | null;
          if (!obj) continue;

          const width = obj.width ?? 0;
          const height = obj.height ?? 0;
          if (!width || !height) continue;

          const bitmap = obj.bitmap;
          if (!bitmap) continue;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.drawImage(bitmap, 0, 0);

          const dataUrl = canvas.toDataURL("image/png");
          const bytes = new Uint8Array(
            atob(dataUrl.split(",")[1]).split("").map((c) => c.charCodeAt(0)),
          );
          out.push({
            bytes,
            name: `image-${n}-${i}.png`,
            width,
            height,
            mimeType: "image/png",
          });
        } catch {
          // Skip images that cannot be decoded.
        }
      }
    }
  } finally {
    pdf.destroy();
  }
  return out;
}