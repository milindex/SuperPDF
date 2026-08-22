import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type {
  AddPageNumbersPayload,
  PageNumberFormat,
  PageNumberPosition,
} from "@/lib/sw-contract";

const MARGIN = 32;

function positionText(
  position: PageNumberPosition,
  width: number,
  height: number,
  textWidth: number,
  fontSize: number,
): { x: number; y: number } {
  const pad = MARGIN;
  const xLeft = pad;
  const xCenter = (width - textWidth) / 2;
  const xRight = width - textWidth - pad;
  const yTop = height - pad - fontSize;
  const yBottom = pad;

  switch (position) {
    case "top-left":
      return { x: xLeft, y: yTop };
    case "top-center":
      return { x: xCenter, y: yTop };
    case "top-right":
      return { x: xRight, y: yTop };
    case "bottom-left":
      return { x: xLeft, y: yBottom };
    case "bottom-center":
      return { x: xCenter, y: yBottom };
    case "bottom-right":
      return { x: xRight, y: yBottom };
  }
}

/**
 * Draw a page number on every page of a PDF.
 * `format`: "page-x-of-y" → "Page N of M", "number-only" → "N".
 * `startNumber` sets the number of the first page (default 1).
 */
export async function addPageNumbers(
  buffer: ArrayBuffer,
  format: PageNumberFormat,
  position: PageNumberPosition,
  startNumber = 1,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const total = pdf.getPageCount();
  const fontSize = 10;

  pdf.getPages().forEach((page, i) => {
    const { width, height } = page.getSize();
    const num = startNumber + i;
    const text = format === "page-x-of-y" ? `Page ${num} of ${total}` : `${num}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const { x, y } = positionText(position, width, height, textWidth, fontSize);
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  return pdf.save();
}

export type { AddPageNumbersPayload };