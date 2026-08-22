import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { reorderPages } from "../logic";

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

describe("reorderPages", () => {
  it("reorders pages and drops unlisted ones", async () => {
    const buf = await makePdf(4);
    const out = await reorderPages(buf, [3, 0]);
    expect(await pageCount(out)).toBe(2);
  });

  it("filters out-of-range indices", async () => {
    const buf = await makePdf(3);
    const out = await reorderPages(buf, [0, 1, 2, 5]);
    expect(await pageCount(out)).toBe(3);
  });

  it("yields a single blank page when the order is empty", async () => {
    const buf = await makePdf(2);
    const out = await reorderPages(buf, []);
    expect(await pageCount(out)).toBe(1);
  });
});