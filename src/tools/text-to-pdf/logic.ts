import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { TextToPdfPayload } from "@/lib/sw-contract";

const MARGIN = 56;
const FONT_SIZE = 11;
const LINE_HEIGHT = 15;

/**
 * Convert plain text into a single-page-per-~50-lines PDF with wrapping.
 * Long lines are hard-wrapped to the page width.
 */
export async function textToPdf(text: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const maxWidth = pageWidth - MARGIN * 2;

  const wrap = (line: string): string[] => {
    if (font.widthOfTextAtSize(line, FONT_SIZE) <= maxWidth) return [line];
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, FONT_SIZE) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const rawLines = text.split(/\r?\n/);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - MARGIN;

  for (const raw of rawLines) {
    const wrapped = raw.trim() === "" ? [""] : wrap(raw.trim());
    for (const line of wrapped) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - MARGIN;
      }
      page.drawText(line, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= LINE_HEIGHT;
    }
  }

  return pdf.save();
}

export type { TextToPdfPayload };