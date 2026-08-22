"use client";

import PptxGenJS from "pptxgenjs";
import { loadPdf, renderPageToDataUrl } from "@/lib/pdfjs";

const SLIDE_W = 10; // inches (16:9 ~ 10 x 5.625)
const SLIDE_H = 5.625;

/**
 * Convert a PDF to a .pptx where each page becomes a slide with the page
 * rendered as an image, sized to fit. Fully client-side.
 */
export async function pdfToPowerPoint(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await loadPdf(buffer);
  try {
    const pptx = new PptxGenJS();
    pptx.defineLayout({
      name: "PDF16x9",
      width: SLIDE_W,
      height: SLIDE_H,
    });
    pptx.layout = "PDF16x9";

    for (let n = 1; n <= pdf.pageCount; n++) {
      const { dataUrl, width, height } = await renderPageToDataUrl(pdf, n, 1.5, "image/png");
      const slide = pptx.addSlide();
      const aspect = height / width;
      let imgW = SLIDE_W - 0.5;
      let imgH = imgW * aspect;
      if (imgH > SLIDE_H - 0.5) {
        imgH = SLIDE_H - 0.5;
        imgW = imgH / aspect;
      }
      slide.addImage({
        data: dataUrl,
        x: (SLIDE_W - imgW) / 2,
        y: (SLIDE_H - imgH) / 2,
        w: imgW,
        h: imgH,
      });
    }

    const out = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
    return new Uint8Array(out);
  } finally {
    pdf.destroy();
  }
}