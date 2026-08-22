import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { redactPdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("redactPdf", () => {
  it("returns a valid PDF for valid regions", async () => {
    const buf = await makePdf(2);
    const out = await redactPdf(buf, [
      { pageIndex: 0, xPct: 10, yPct: 10, widthPct: 30, heightPct: 20 },
    ]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("ignores regions pointing to non-existent pages", async () => {
    const buf = await makePdf(1);
    const out = await redactPdf(buf, [
      { pageIndex: 5, xPct: 0, yPct: 0, widthPct: 10, heightPct: 10 },
    ]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});