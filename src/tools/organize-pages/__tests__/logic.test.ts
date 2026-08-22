import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { organizePages } from "../logic";

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

describe("organizePages", () => {
  it("reorders and removes pages from a single document", async () => {
    const buf = await makePdf(4);
    const out = await organizePages([buf], [3, 0]);
    expect(await pageCount(out)).toBe(2);
  });

  it("combines pages across multiple documents", async () => {
    const a = await makePdf(2);
    const b = await makePdf(3);
    const out = await organizePages([a, b], [0, 2, 3]); // global indices
    expect(await pageCount(out)).toBe(3);
  });

  it("throws when the order contains no valid pages", async () => {
    const buf = await makePdf(2);
    await expect(organizePages([buf], [10, 20])).rejects.toThrow("No pages");
  });
});