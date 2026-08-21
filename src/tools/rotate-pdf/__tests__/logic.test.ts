import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { rotatePdf, rotateAllPages } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 300]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("rotatePdf", () => {
  it("rotates a specific page by the given degrees", async () => {
    const buf = await makePdf(3);
    const out = await rotatePdf(buf, { 1: 90 });
    const doc = await PDFDocument.load(out);
    const pages = doc.getPages();
    expect(pages[0].getRotation().angle).toBe(0);
    expect(pages[1].getRotation().angle).toBe(90);
    expect(pages[2].getRotation().angle).toBe(0);
  });

  it("accumulates rotation on top of existing rotation", async () => {
    const buf = await makePdf(2);
    const once = await rotatePdf(buf, { 0: 90 });
    const twice = await rotatePdf(once, { 0: 90 });
    const doc = await PDFDocument.load(twice);
    expect(doc.getPages()[0].getRotation().angle).toBe(180);
  });

  it("ignores out-of-range page indices", async () => {
    const buf = await makePdf(2);
    const rotations: Record<number, number> = { 99: 90 };
    rotations[-1] = 90;
    const out = await rotatePdf(buf, rotations);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});

describe("rotateAllPages", () => {
  it("rotates every page by the same amount", async () => {
    const buf = await makePdf(4);
    const out = await rotateAllPages(buf, 270);
    const doc = await PDFDocument.load(out);
    const angles = doc.getPages().map((p) => p.getRotation().angle);
    expect(angles).toEqual([270, 270, 270, 270]);
  });
});