import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const addImage = vi.fn();
  const addSlide = vi.fn(() => ({ addImage }));
  const write = vi.fn(async () => new Uint8Array([1, 2]).buffer);
  const defineLayout = vi.fn();
  class FakePptx {
    layout = "";
    defineLayout = defineLayout;
    addSlide = addSlide;
    write = write;
  }
  return {
    addImage,
    addSlide,
    write,
    defineLayout,
    FakePptx,
    loadPdf: vi.fn(),
    renderPageToDataUrl: vi.fn(),
  };
});

vi.mock("pptxgenjs", () => ({ default: mocks.FakePptx }));
vi.mock("@/lib/pdfjs", () => ({
  loadPdf: mocks.loadPdf,
  renderPageToDataUrl: mocks.renderPageToDataUrl,
}));

import { pdfToPowerPoint } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.addImage.mockClear();
  mocks.addSlide.mockClear();
  mocks.write.mockClear();
  mocks.defineLayout.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToDataUrl.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToDataUrl.mockImplementation(
    async (_pdf: unknown, page: number) =>
      page === 1
        ? { dataUrl: "data:image/png;base64,WIDE", width: 800, height: 400 }
        : { dataUrl: "data:image/png;base64,TALL", width: 400, height: 800 },
  );
});

describe("pdfToPowerPoint", () => {
  it("creates one 16:9 slide per page and fits each image", async () => {
    const out = await pdfToPowerPoint(new ArrayBuffer(4));

    expect(mocks.defineLayout).toHaveBeenCalledWith({
      name: "PDF16x9",
      width: 10,
      height: 5.625,
    });
    expect(mocks.addSlide).toHaveBeenCalledTimes(2);
    expect(mocks.renderPageToDataUrl).toHaveBeenCalledWith(
      pdf,
      1,
      1.5,
      "image/png",
    );
    expect(Array.from(out)).toEqual([1, 2]);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("letterboxes a wide page inside the slide", () => {
    mocks.renderPageToDataUrl.mockResolvedValue({
      dataUrl: "data:image/png;base64,WIDE",
      width: 800,
      height: 400,
    });

    return pdfToPowerPoint(new ArrayBuffer(4)).then(() => {
      const image = mocks.addImage.mock.calls[0][0] as {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      expect(image.w).toBeCloseTo(9.5);
      expect(image.h).toBeCloseTo(4.75);
      expect(image.x).toBeCloseTo(0.25);
      expect(image.y).toBeCloseTo(0.4375);
    });
  });

  it("clamps a tall page to the slide height", () => {
    mocks.renderPageToDataUrl.mockResolvedValue({
      dataUrl: "data:image/png;base64,TALL",
      width: 400,
      height: 800,
    });

    return pdfToPowerPoint(new ArrayBuffer(4)).then(() => {
      const image = mocks.addImage.mock.calls[0][0] as {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      expect(image.h).toBeCloseTo(5.125);
      expect(image.w).toBeCloseTo(2.5625);
      expect(image.x).toBeCloseTo(3.71875);
      expect(image.y).toBeCloseTo(0.25);
    });
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToDataUrl.mockRejectedValue(new Error("boom"));
    await expect(pdfToPowerPoint(new ArrayBuffer(4))).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
