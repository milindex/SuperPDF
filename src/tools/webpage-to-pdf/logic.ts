"use client";

/**
 * Convert a webpage URL to a PDF using html2pdf.js. Works only for pages that
 * allow cross-origin reads (CORS) or are same-origin; most third-party sites
 * block this in the browser. Fully client-side — no server involved.
 */
export async function webpageToPdf(url: string): Promise<Uint8Array> {
  const html2pdf = (await import("html2pdf.js")).default;
  const html = await fetch(url, { mode: "cors" }).then((r) => {
    if (!r.ok) throw new Error(`Failed to load ${url} (status ${r.status}).`);
    return r.text();
  });

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  document.body.appendChild(container);

  try {
    const blob = await html2pdf()
      .set({
        margin: 10,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .outputPdf("blob");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    document.body.removeChild(container);
  }
}