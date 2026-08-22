import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { csvToPdf, parseCsv } from "../logic";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas", () => {
    expect(parseCsv('"hello, world",x')).toEqual([["hello, world", "x"]]);
  });

  it("handles escaped quotes", () => {
    expect(parseCsv('"say ""hi""",y')).toEqual([['say "hi"', "y"]]);
  });

  it("skips blank lines", () => {
    expect(parseCsv("a\n\nb")).toEqual([["a"], ["b"]]);
  });
});

describe("csvToPdf", () => {
  it("produces a valid PDF", async () => {
    const out = await csvToPdf("name,age\nAlice,30\nBob,25");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });

  it("handles a whitespace-only CSV without crashing", async () => {
    const out = await csvToPdf(" ");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});