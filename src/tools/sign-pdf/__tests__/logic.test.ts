import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { signPdf } from "../logic";

/** Minimal valid 1x1 PNG. */
const TINY_PNG = new Uint8Array(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
);

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 600]);
  const bytes = await doc.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

describe("signPdf", () => {
  it("adds the signature to the first page", async () => {
    const buf = await makePdf(2);
    const out = await signPdf(buf, TINY_PNG, 0, 100);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("defaults to the first page", async () => {
    const buf = await makePdf(1);
    const out = await signPdf(buf, TINY_PNG);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});