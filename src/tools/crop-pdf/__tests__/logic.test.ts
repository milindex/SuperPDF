import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { cropPdf } from "../logic";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function cropBox(buf: Uint8Array): Promise<{ width: number; height: number }> {
  const doc = await PDFDocument.load(buf);
  const page = doc.getPage(0);
  const box = page.getCropBox();
  return { width: box.width, height: box.height };
}

describe("cropPdf", () => {
  it("shrinks the crop box by the given margins", async () => {
    const buf = await makePdf(1);
    const out = await cropPdf(buf, 10, 10, 10, 10);
    const box = await cropBox(out);
    expect(box.width).toBeCloseTo(320, 0); // 400 - 40 - 40
    expect(box.height).toBeCloseTo(480, 0); // 600 - 60 - 60
  });

  it("keeps the crop box unchanged when margins are zero", async () => {
    const buf = await makePdf(1);
    const out = await cropPdf(buf, 0, 0, 0, 0);
    const box = await cropBox(out);
    expect(box.width).toBeCloseTo(400, 0);
    expect(box.height).toBeCloseTo(600, 0);
  });
});