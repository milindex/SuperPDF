"use client";

import { Document, Packer, Paragraph, TextRun } from "docx";
import { loadPdf } from "@/lib/pdfjs";

/**
 * Convert a PDF to an editable .docx by extracting its text layer and laying
 * it out as paragraphs. Fully client-side.
 */
export async function pdfToWord(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await loadPdf(buffer);
  try {
    const paragraphs: Paragraph[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      let line = "";
      const pushLine = () => {
        if (line.trim()) {
          paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
        }
        line = "";
      };
      for (const item of content.items) {
        if (!("str" in item)) continue;
        line += item.str ?? "";
        if (item.hasEOL) pushLine();
      }
      pushLine();
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    }

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const out = await Packer.toArrayBuffer(doc);
    return new Uint8Array(out);
  } finally {
    pdf.destroy();
  }
}