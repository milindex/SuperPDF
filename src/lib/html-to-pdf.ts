"use client";

/**
 * Convert an HTML string to a PDF via html2pdf.js. The HTML is rendered into
 * an off-DOM container, converted, and torn down. Fully client-side.
 */
export async function htmlToPdf(html: string, filename = "document.pdf"): Promise<Uint8Array> {
  const html2pdf = (await import("html2pdf.js")).default;
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  document.body.appendChild(container);

  try {
    const pdfBlob = await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .outputPdf("blob");

    const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
    return bytes;
  } finally {
    document.body.removeChild(container);
  }
}