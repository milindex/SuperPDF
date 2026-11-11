import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToBlob: vi.fn(),
  blobToBytes: vi.fn(async (blob: Blob) => new Uint8Array(await blob.arrayBuffer())),
}));

vi.mock("@/lib/pdfjs", () => mocks);

const pdfLib = vi.hoisted(() => {
  const pages: { drawImage: ReturnType<typeof vi.fn> }[] = [];
  const out = {
    embedJpg: vi.fn(async (bytes: Uint8Array) => ({ bytes })),
    addPage: vi.fn(() => {
      const page = { drawImage: vi.fn() };
      pages.push(page);
      return page;
    }),
    save: vi.fn(async () => new Uint8Array([11, 12])),
  };
  return { create: vi.fn(async () => out), out, pages };
});

vi.mock("pdf-lib", () => ({ PDFDocument: { create: pdfLib.create } }));

import { compressPdf } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  pdfLib.create.mockClear();
  pdfLib.out.embedJpg.mockClear();
  pdfLib.out.addPage.mockClear();
  pdfLib.out.save.mockClear();
  pdfLib.pages.length = 0;

  mocks.loadPdf.mockReset();
  mocks.renderPageToBlob.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToBlob.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      blob: new Blob([`PAGE${page}`]),
      width: 100 * page,
      height: 200 * page,
    }),
  );
});

describe("compressPdf", () => {
  it("renders every page to JPEG and rebuilds the document", async () => {
    const out = await compressPdf(new ArrayBuffer(4));

    expect(mocks.renderPageToBlob).toHaveBeenNthCalledWith(
      1,
      pdf,
      1,
      1,
      "image/jpeg",
      0.7,
    );
    expect(mocks.renderPageToBlob).toHaveBeenNthCalledWith(
      2,
      pdf,
      2,
      1,
      "image/jpeg",
      0.7,
    );
    expect(mocks.blobToBytes).toHaveBeenCalledTimes(2);
    expect(mocks.blobToBytes).toHaveBeenCalledWith(expect.any(Blob));
    expect(pdfLib.out.embedJpg).toHaveBeenCalledTimes(2);
    expect(pdfLib.out.addPage).toHaveBeenNthCalledWith(1, [100, 200]);
    expect(pdfLib.out.addPage).toHaveBeenNthCalledWith(2, [200, 400]);
    expect(pdfLib.pages).toHaveLength(2);
    expect(pdfLib.out.save).toHaveBeenCalledWith({ useObjectStreams: true });
    expect(Array.from(out)).toEqual([11, 12]);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("passes custom quality and scale through", async () => {
    await compressPdf(new ArrayBuffer(4), 0.4, 0.5);
    expect(mocks.renderPageToBlob).toHaveBeenCalledWith(
      pdf,
      1,
      0.5,
      "image/jpeg",
      0.4,
    );
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToBlob.mockRejectedValue(new Error("render failed"));
    await expect(compressPdf(new ArrayBuffer(4))).rejects.toThrow("render failed");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
