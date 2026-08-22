import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { repairPdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 300]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("repairPdf", () => {
  it("returns a loadable PDF with the same page count", async () => {
    const buf = await makePdf(4);
    const out = await repairPdf(buf);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(4);
  });
});