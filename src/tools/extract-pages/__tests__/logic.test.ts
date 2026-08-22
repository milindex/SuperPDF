import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { extractPages } from "../logic";

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

describe("extractPages", () => {
  it("keeps the selected pages in the given order", async () => {
    const buf = await makePdf(5);
    const out = await extractPages(buf, [4, 0, 2]);
    expect(await pageCount(out)).toBe(3);
  });

  it("throws when no valid pages are provided", async () => {
    const buf = await makePdf(3);
    await expect(extractPages(buf, [10, 20])).rejects.toThrow("No valid pages");
  });

  it("ignores out-of-range indices", async () => {
    const buf = await makePdf(3);
    const out = await extractPages(buf, [0, 99]);
    expect(await pageCount(out)).toBe(1);
  });
});