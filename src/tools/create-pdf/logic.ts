"use client";

import { PDFDocument } from "pdf-lib";

export const PAGE_PRESETS = {
  a4: { width: 595.28, height: 841.89, label: "A4" },
  letter: { width: 612, height: 792, label: "Letter" },
  a5: { width: 419.53, height: 595.28, label: "A5" },
  legal: { width: 612, height: 1008, label: "Legal" },
} as const;

export type PagePreset = keyof typeof PAGE_PRESETS;
export type Orientation = "portrait" | "landscape";

export async function createBlankPdf(
  preset: PagePreset,
  orientation: Orientation,
  pageCount: number,
): Promise<Uint8Array> {
  const count = Math.floor(pageCount);
  if (!Number.isFinite(count) || count < 1 || count > 200) {
    throw new Error("Enter between 1 and 200 pages.");
  }
  const size = PAGE_PRESETS[preset];
  const width = orientation === "landscape" ? size.height : size.width;
  const height = orientation === "landscape" ? size.width : size.height;
  const pdf = await PDFDocument.create();
  for (let page = 0; page < count; page += 1) {
    pdf.addPage([width, height]);
  }
  pdf.setTitle("Blank document");
  pdf.setProducer("SuperPDF");
  return pdf.save();
}
