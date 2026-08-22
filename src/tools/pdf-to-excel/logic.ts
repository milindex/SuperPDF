"use client";

import * as XLSX from "xlsx";
import { loadPdf } from "@/lib/pdfjs";

/**
 * Convert a PDF to an .xlsx workbook. Text-layer content is placed into one
 * worksheet per page, one text line per row. Fully client-side.
 */
export async function pdfToExcel(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await loadPdf(buffer);
  try {
    const wb = XLSX.utils.book_new();
    for (let n = 1; n <= pdf.pageCount; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      let line = "";
      const rows: string[][] = [];
      const pushLine = () => {
        if (line.trim()) rows.push([line]);
        line = "";
      };
      for (const item of content.items) {
        if (!("str" in item)) continue;
        line += item.str ?? "";
        if (item.hasEOL) pushLine();
      }
      pushLine();
      if (rows.length === 0) rows.push([" "]);
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, sheet, `Page ${n}`);
    }
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Uint8Array(out as ArrayBuffer);
  } finally {
    pdf.destroy();
  }
}