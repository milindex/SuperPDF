"use client";

import { htmlToPdf } from "@/lib/html-to-pdf";

export async function htmlFileToPdf(file: File): Promise<Uint8Array> {
  const html = await file.text();
  if (!html.trim()) throw new Error("The HTML file is empty.");
  return htmlToPdf(html, "document.pdf");
}
