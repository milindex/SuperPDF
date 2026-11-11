import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToBlob: vi.fn(),
  blobToBytes: vi.fn(async () => new Uint8Array()),
}));

vi.mock("@/lib/pdfjs", () => mocks);

import { pdfToPng } from "../logic";

const pdf = { pageCount: 3, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToBlob.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToBlob.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      blob: new Blob([`P${page}`]),
      width: 1200,
      height: 900,
    }),
  );
});

describe("pdfToPng", () => {
  it("renders every page to a named PNG", async () => {
    const images = await pdfToPng(new ArrayBuffer(4));

    expect(mocks.renderPageToBlob).toHaveBeenNthCalledWith(
      1,
      pdf,
      1,
      2,
      "image/png",
    );
    expect(images.map((image) => image.name)).toEqual([
      "page-1.png",
      "page-2.png",
      "page-3.png",
    ]);
    expect(images[2]).toMatchObject({ width: 1200, height: 900 });
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("passes a custom scale", async () => {
    await pdfToPng(new ArrayBuffer(4), 1.5);
    expect(mocks.renderPageToBlob).toHaveBeenCalledWith(
      pdf,
      1,
      1.5,
      "image/png",
    );
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToBlob.mockRejectedValue(new Error("boom"));
    await expect(pdfToPng(new ArrayBuffer(4))).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
