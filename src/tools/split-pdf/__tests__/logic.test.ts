import { describe, it, expect } from "vitest";
import { PDFDocument, PDFName, PDFArray, PDFRef, PDFString } from "pdf-lib";
import {
  parseRanges,
  splitPdfByRange,
  splitPdfByPages,
  splitPdfBySize,
  splitPdfByEvenOdd,
  splitPdfEveryN,
  splitPdfByBookmarks,
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

describe("splitPdfByEvenOdd", () => {
  it("splits a 5-page PDF into odd (3) and even (2) documents", async () => {
    const buf = await makePdf(5);
    const out = await splitPdfByEvenOdd(buf);
    expect(out).toHaveLength(2);
    expect(await pageCount(out[0])).toBe(3);
    expect(await pageCount(out[1])).toBe(2);
  });

  it("drops the empty half for a single-page PDF", async () => {
    const buf = await makePdf(1);
    const out = await splitPdfByEvenOdd(buf);
    expect(out).toHaveLength(1);
    expect(await pageCount(out[0])).toBe(1);
  });
});

describe("splitPdfEveryN", () => {
  it("splits 7 pages into chunks of 2", async () => {
    const buf = await makePdf(7);
    const out = await splitPdfEveryN(buf, 2);
    expect(out).toHaveLength(4);
    expect(await pageCount(out[0])).toBe(2);
    expect(await pageCount(out[3])).toBe(1);
  });

  it("produces one document when n exceeds page count", async () => {
    const buf = await makePdf(3);
    const out = await splitPdfEveryN(buf, 10);
    expect(out).toHaveLength(1);
    expect(await pageCount(out[0])).toBe(3);
  });

  it("rejects a non-positive n", async () => {
    const buf = await makePdf(3);
    await expect(splitPdfEveryN(buf, 0)).rejects.toThrow(/positive integer/);
  });
});

describe("splitPdfByBookmarks", () => {
  /** Build a PDF with top-level bookmarks pointing at pages 1, 3, and 6. */
  async function makeBookmarkedPdf(): Promise<ArrayBuffer> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 8; i++) doc.addPage([200, 300]);

    const context = doc.context;
    const outlineItems: PDFRef[] = [];
    const firstRefs: PDFRef[] = [];

    const makeItem = (title: string, pageIndex: number): PDFRef => {
      const pageNode = doc.getPage(pageIndex).node;
      const pageRef = context.getObjectRef(pageNode);
      if (!pageRef) throw new Error("page ref missing");
      const dest = context.obj([
        pageRef,
        PDFName.of("XYZ"),
        0,
        0,
        null,
      ]) as PDFArray;
      const item = context.obj({
        Title: PDFString.of(title),
        Dest: dest,
      });
      return context.register(item);
    };

    for (const [title, pageIndex] of [
      ["Intro", 0],
      ["Chapter 1", 2],
      ["Chapter 2", 5],
    ] as const) {
      const ref = makeItem(title, pageIndex);
      outlineItems.push(ref);
    }

    const root = context.obj({});
    const rootRef = context.register(root);
    const first = outlineItems[0];
    for (let i = 0; i < outlineItems.length; i++) {
      const ref = outlineItems[i];
      const item = context.lookup(ref) as import("pdf-lib").PDFDict;
      item.set(PDFName.of("Parent"), rootRef);
      if (i === 0) item.set(PDFName.of("Prev"), firstRefs[0] ?? context.obj(null));
      if (i + 1 < outlineItems.length) {
        const next = outlineItems[i + 1];
        item.set(PDFName.of("Next"), next);
        const nextItem = context.lookup(next) as import("pdf-lib").PDFDict;
        nextItem.set(PDFName.of("Prev"), ref);
      }
      firstRefs.push(ref);
    }

    root.set(PDFName.of("First"), first);
    root.set(PDFName.of("Last"), outlineItems[outlineItems.length - 1]);
    root.set(PDFName.of("Count"), context.obj(outlineItems.length));
    doc.catalog.set(PDFName.of("Outlines"), rootRef);

    const bytes = await doc.save();
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  }

  it("splits a bookmarked PDF into one document per section", async () => {
    const buf = await makeBookmarkedPdf();
    const out = await splitPdfByBookmarks(buf);
    expect(out).toHaveLength(3);
    expect(await pageCount(out[0])).toBe(2);
    expect(await pageCount(out[1])).toBe(3);
    expect(await pageCount(out[2])).toBe(3);
  });

  it("throws when the PDF has no resolvable bookmarks", async () => {
    const buf = await makePdf(4);
    await expect(splitPdfByBookmarks(buf)).rejects.toThrow(/No bookmarks/);
  });
});