import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { textToPdf } from "../logic";

describe("textToPdf", () => {
  it("produces a one-page PDF for short text", async () => {
    const out = await textToPdf("Hello world");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });

  it("produces multiple pages for long text", async () => {
    const long = Array.from({ length: 2000 }, (_, i) => `Line ${i}`).join("\n");
    const out = await textToPdf(long);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBeGreaterThan(1);
  });

  it("handles empty text gracefully", async () => {
    const out = await textToPdf("");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});