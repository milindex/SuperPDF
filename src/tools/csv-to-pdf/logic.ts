import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CsvToPdfPayload } from "@/lib/sw-contract";

const MARGIN = 48;
const FONT_SIZE = 9;
const ROW_HEIGHT = 16;
const MAX_COLS = 6;

/**
 * Convert CSV contents into a PDF table (A4 portrait). Columns are evenly
 * distributed; each row becomes one table row. Handles quoted fields and
 * embedded commas/newlines.
 */
export async function csvToPdf(csv: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const rows = parseCsv(csv);
  if (rows.length === 0) throw new Error("The CSV file is empty.");

  const colCount = Math.min(Math.max(...rows.map((r) => r.length)), MAX_COLS);
  const tableWidth = pageWidth - MARGIN * 2;
  const colWidth = tableWidth / colCount;

  const truncate = (text: string, maxChars: number): string =>
    text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - MARGIN;
  let firstRow = true;

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const isHeader = firstRow;
    if (y < MARGIN + ROW_HEIGHT) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - MARGIN;
    }
    for (let ci = 0; ci < colCount; ci++) {
      const cell = row[ci] ?? "";
      const maxChars = Math.floor(colWidth / (FONT_SIZE * 0.6));
      page.drawText(truncate(cell, maxChars), {
        x: MARGIN + ci * colWidth + 4,
        y,
        size: FONT_SIZE,
        font: isHeader ? boldFont : font,
        color: rgb(0.1, 0.1, 0.1),
      });
    }
    y -= ROW_HEIGHT;
    firstRow = false;
  }

  return pdf.save();
}

/** Minimal RFC-4180-ish CSV parser handling quotes, commas, and newlines. */
export function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && csv[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

export type { CsvToPdfPayload };