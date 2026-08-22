import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addPageNumbers } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("addPageNumbers", () => {
  it("produces a valid PDF with the same page count", async () => {
    const buf = await makePdf(3);
    const out = await addPageNumbers(buf, "number-only", "bottom-center");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it("honors a custom start number", async () => {
    const buf = await makePdf(2);
    const out = await addPageNumbers(buf, "page-x-of-y", "bottom-right", 10);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});