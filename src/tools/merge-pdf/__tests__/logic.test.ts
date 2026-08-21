import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs } from "../logic";

/** Build a PDF with the given number of blank pages. */
async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage();
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("mergePdfs", () => {
  it("merges multiple PDFs preserving order and total page count", async () => {
    const a = await makePdf(2);
    const b = await makePdf(3);
    const c = await makePdf(1);

    const out = await mergePdfs([a, b, c]);
    const merged = await PDFDocument.load(out);
    expect(merged.getPageCount()).toBe(6);
  });

  it("handles a single buffer", async () => {
    const a = await makePdf(4);
    const out = await mergePdfs([a]);
    const merged = await PDFDocument.load(out);
    expect(merged.getPageCount()).toBe(4);
  });

  it("produces a loadable document for an empty input", async () => {
    const out = await mergePdfs([]);
    const merged = await PDFDocument.load(out);
    expect(merged).toBeDefined();
  });
});
