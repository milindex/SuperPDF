"use client";

import { loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

/**
 * Convert a PDF to a standalone HTML file with one embedded page image per
 * <section>. Fully client-side.
 */
export async function pdfToHtml(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await loadPdf(buffer);
  try {
    const sections: string[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const { dataUrl } = await renderPageToDataUrl(pdf, n, 2, "image/png");
      sections.push(`<section style="margin:0 0 2em 0;text-align:center;">
  <img src="${dataUrl}" style="max-width:100%;height:auto;" alt="Page ${n}"/>
</section>`);
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PDF as HTML</title>
<style>body{margin:0;background:#e5e7eb;font-family:system-ui,sans-serif;}main{max-width:800px;margin:0 auto;padding:1em;}</style>
</head>
<body>
<main>
${sections.join("\n")}
</main>
</body>
</html>`;
    return new TextEncoder().encode(html);
  } finally {
    pdf.destroy();
  }
}