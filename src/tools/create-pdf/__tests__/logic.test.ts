import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { PAGE_PRESETS, createBlankPdf } from "../logic";

describe("createBlankPdf", () => {
  it("creates A4 portrait pages", async () => {
    const pdf = await PDFDocument.load(
      await createBlankPdf("a4", "portrait", 2),
    );

    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getTitle()).toBe("Blank document");
    const { width, height } = pdf.getPage(0).getSize();
    expect(width).toBeCloseTo(PAGE_PRESETS.a4.width);
    expect(height).toBeCloseTo(PAGE_PRESETS.a4.height);
  });

  it("swaps dimensions for landscape", async () => {
    const pdf = await PDFDocument.load(
      await createBlankPdf("letter", "landscape", 1),
    );
    const { width, height } = pdf.getPage(0).getSize();

    expect(width).toBeCloseTo(792);
    expect(height).toBeCloseTo(612);
  });

  it("floors fractional page counts", async () => {
    const pdf = await PDFDocument.load(
      await createBlankPdf("a5", "portrait", 2.9),
    );
    expect(pdf.getPageCount()).toBe(2);
  });

  it.each([0, -1, 201, Number.NaN])(
    "rejects an invalid page count of %s",
    async (count) => {
      await expect(createBlankPdf("a4", "portrait", count)).rejects.toThrow(
        "Enter between 1 and 200 pages.",
      );
    },
  );
});
