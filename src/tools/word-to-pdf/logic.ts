"use client";

import mammoth from "mammoth";
import { htmlToPdf } from "@/lib/html-to-pdf";

/**
 * Convert a .docx document to a PDF. mammoth extracts the document to HTML
 * (text, tables, headings), then html2pdf renders it. Fully client-side.
 */
export async function wordToPdf(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  if (!result.value.trim()) throw new Error("No content found in this document.");
  const styled = `<div style="font-family:sans-serif;line-height:1.5;">
    <style>table{border-collapse:collapse;}td,th{border:1px solid #ccc;padding:4px 8px;}</style>
    ${result.value}
  </div>`;
  return htmlToPdf(styled, "word.pdf");
}