import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  parseRanges,
  splitPdfByRange,
  splitPdfByPages,
  splitPdfBySize,
} from "../logic";

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

describe("parseRanges", () => {
  it("parses single pages and ranges", () => {
    expect(parseRanges("1-3,5,8-10")).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
  });

  it("drops invalid tokens but keeps valid single pages", () => {
    expect(parseRanges("abc,2,0-1,4-2,7-")).toEqual([
      { start: 2, end: 2 },
      { start: 7, end: 7 },
    ]);
  });
});

describe("splitPdfByRange", () => {
  it("splits into one document per range", async () => {
    const buf = await makePdf(10);
    const out = await splitPdfByRange(buf, "1-2,4,8-9");
    expect(out).toHaveLength(3);
    expect(await pageCount(out[0])).toBe(2);
    expect(await pageCount(out[1])).toBe(1);
    expect(await pageCount(out[2])).toBe(2);
  });

  it("clamps ranges beyond page count", async () => {
    const buf = await makePdf(5);
    const out = await splitPdfByRange(buf, "3-20");
    expect(await pageCount(out[0])).toBe(3);
  });
});

describe("splitPdfByPages", () => {
  it("creates a single doc with the selected pages", async () => {
    const buf = await makePdf(6);
    const out = await splitPdfByPages(buf, [1, 3, 5]);
    expect(out).toHaveLength(1);
    expect(await pageCount(out[0])).toBe(3);
  });

  it("returns empty when no valid pages", async () => {
    const buf = await makePdf(3);
    const out = await splitPdfByPages(buf, [99, 100]);
    expect(out).toHaveLength(0);
  });
});

describe("splitPdfBySize", () => {
  it("splits a large document into at least two chunks", async () => {
    const buf = await makePdf(8);
    const out = await splitPdfBySize(buf, 1);
    expect(out.length).toBeGreaterThan(1);
  });

  it("returns a single document when size is not exceeded", async () => {
    const buf = await makePdf(2);
    const out = await splitPdfBySize(buf, 1024 * 1024);
    expect(out).toHaveLength(1);
  });
});