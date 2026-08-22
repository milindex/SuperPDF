import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { PRESET_SIZES, resizePdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("PRESET_SIZES", () => {
  it("contains the standard page sizes", () => {
    expect(PRESET_SIZES.a4.width).toBeCloseTo(595.28, 1);
    expect(PRESET_SIZES.letter.height).toBe(792);
  });
});

describe("resizePdf", () => {
  it("resizes every page's media box", async () => {
    const buf = await makePdf(2);
    const out = await resizePdf(buf, 300, 400);
    const doc = await PDFDocument.load(out);
    for (let i = 0; i < doc.getPageCount(); i++) {
      const { width, height } = doc.getPage(i).getSize();
      expect(width).toBeCloseTo(300, 0);
      expect(height).toBeCloseTo(400, 0);
    }
  });
});