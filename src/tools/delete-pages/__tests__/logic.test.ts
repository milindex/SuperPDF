import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { deletePages } from "../logic";

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

describe("deletePages", () => {
  it("removes the requested pages", async () => {
    const buf = await makePdf(5);
    const out = await deletePages(buf, [1, 3]);
    expect(await pageCount(out)).toBe(3);
  });

  it("ignores out-of-range and negative indices", async () => {
    const buf = await makePdf(4);
    const out = await deletePages(buf, [0, 99, -1]);
    expect(await pageCount(out)).toBe(3);
  });

  it("deleting all pages yields a single blank page", async () => {
    const buf = await makePdf(2);
    const out = await deletePages(buf, [0, 1]);
    expect(await pageCount(out)).toBe(1);
  });
});