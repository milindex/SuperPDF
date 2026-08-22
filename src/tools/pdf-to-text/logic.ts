"use client";

import { loadPdf } from "@/lib/pdfjs";

/**
 * Extract the text content of every page of a PDF and return it as plain
 * text (pages separated by form feeds). Runs fully client-side via pdf.js.
 */
export async function pdfToText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await loadPdf(buffer);
  try {
    const parts: string[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const str = item.str ?? "";
        if (!str) continue;
        if (item.hasEOL) {
          lines.push(line + str);
          line = "";
        } else {
          line += str;
        }
      }
      if (line) lines.push(line);
      parts.push(lines.join("\n"));
    }
    return parts.join("\n\n");
  } finally {
    pdf.destroy();
  }
}