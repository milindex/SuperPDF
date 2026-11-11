import { beforeEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToDataUrl: vi.fn(),
}));

vi.mock("@/lib/pdfjs", () => mocks);

import { exportThumbnails } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToDataUrl.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToDataUrl.mockImplementation(
    async () => ({
      dataUrl: "data:image/png;base64,QUJDRA==",
    }),
  );
});

describe("exportThumbnails", () => {
  it("zips one padded image per page and reports progress", async () => {
    const onProgress = vi.fn();
    const blob = await exportThumbnails(new ArrayBuffer(4), "png", 2, onProgress);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files)).toEqual(["page-1.png", "page-2.png"]);
    expect(await zip.file("page-1.png")?.async("string")).toBe("ABCD");
    expect(onProgress.mock.calls.map(([value]) => value)).toEqual([
      45, 90, 95, 100,
    ]);
    expect(mocks.renderPageToDataUrl).toHaveBeenCalledWith(
      pdf,
      1,
      2,
      "image/png",
      0.9,
    );
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("uses jpg names and the JPEG mime type", async () => {
    mocks.renderPageToDataUrl.mockResolvedValue({
      dataUrl: "data:image/jpeg;base64,QUJD",
    });
    const blob = await exportThumbnails(new ArrayBuffer(4), "jpeg", 1);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files)).toEqual(["page-1.jpg", "page-2.jpg"]);
    expect(mocks.renderPageToDataUrl).toHaveBeenCalledWith(
      pdf,
      1,
      1,
      "image/jpeg",
      0.9,
    );
  });

  it("zero-pads names to the page count width", async () => {
    const many = { pageCount: 12, destroy: vi.fn() };
    mocks.loadPdf.mockResolvedValue(many);
    mocks.renderPageToDataUrl.mockResolvedValue({
      dataUrl: "data:image/png;base64,QUJD",
    });

    const blob = await exportThumbnails(new ArrayBuffer(4), "png", 1);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(Object.keys(zip.files)[0]).toBe("page-01.png");
    expect(Object.keys(zip.files)[11]).toBe("page-12.png");
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToDataUrl.mockRejectedValue(new Error("boom"));
    await expect(
      exportThumbnails(new ArrayBuffer(4), "png", 1),
    ).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
