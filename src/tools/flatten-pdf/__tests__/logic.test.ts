import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { flattenPdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 300]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function pageCount(buf: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(buf);
  return doc.getPageCount();
}

describe("flattenPdf", () => {
  it("preserves every page", async () => {
    const buf = await makePdf(5);
    const out = await flattenPdf(buf);
    expect(await pageCount(out)).toBe(5);
  });
});