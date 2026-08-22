"use client";

import * as XLSX from "xlsx";
import { htmlToPdf } from "@/lib/html-to-pdf";

/**
 * Convert an .xlsx/.xls workbook to a PDF by rendering each worksheet as an
 * HTML table. Fully client-side.
 */
export async function excelToPdf(file: File): Promise<Uint8Array> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array" });
  if (wb.SheetNames.length === 0) throw new Error("The workbook is empty.");

  const escapeHtml = (v: unknown): string =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const sheets = wb.SheetNames.map((name) => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], {
      header: 1,
      defval: "",
    }) as unknown[][];
    const body = rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td style="padding:4px 8px;border:1px solid #ddd;">${escapeHtml(cell)}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    return `<h3 style="font-family:sans-serif;">${escapeHtml(name)}</h3>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:11px;">
        <tbody>${body}</tbody>
      </table>`;
  });

  const html = `<div style="font-family:sans-serif;">${sheets.join('<div style="height:16px;"></div>')}</div>`;
  return htmlToPdf(html, "excel.pdf");
}