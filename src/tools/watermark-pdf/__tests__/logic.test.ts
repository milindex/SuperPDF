import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { watermarkPdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("watermarkPdf", () => {
  it("produces a valid PDF for every page", async () => {
    const buf = await makePdf(3);
    const out = await watermarkPdf(buf, "CONFIDENTIAL", 24, 0.5);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it("uses defaults when options are omitted", async () => {
    const buf = await makePdf(1);
    const out = await watermarkPdf(buf, "DRAFT");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});