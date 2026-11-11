import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToBlob: vi.fn(),
  blobToBytes: vi.fn(async (blob: Blob) => new Uint8Array(await blob.arrayBuffer())),
}));

vi.mock("@/lib/pdfjs", () => mocks);

import { pdfToJpg } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToBlob.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToBlob.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      blob: new Blob([`data:image/jpeg;base64,P${page}`]),
      width: 800,
      height: 600,
    }),
  );
});

describe("pdfToJpg", () => {
  it("renders each page to a named JPEG with dimensions", async () => {
    const images = await pdfToJpg(new ArrayBuffer(4));

    expect(mocks.renderPageToBlob).toHaveBeenNthCalledWith(
      1,
      pdf,
      1,
      2,
      "image/jpeg",
      0.85,
    );
    expect(images).toHaveLength(2);
    expect(images[0]).toMatchObject({
      name: "page-1.jpg",
      width: 800,
      height: 600,
    });
    expect(new TextDecoder().decode(images[0].bytes)).toBe(
      "data:image/jpeg;base64,P1",
    );
    expect(images[1].name).toBe("page-2.jpg");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("passes custom quality and scale", async () => {
    await pdfToJpg(new ArrayBuffer(4), 0.5, 1);
    expect(mocks.renderPageToBlob).toHaveBeenCalledWith(
      pdf,
      1,
      1,
      "image/jpeg",
      0.5,
    );
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToBlob.mockRejectedValue(new Error("boom"));
    await expect(pdfToJpg(new ArrayBuffer(4))).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
