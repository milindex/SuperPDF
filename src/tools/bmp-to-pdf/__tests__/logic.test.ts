import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { bmpToPdf } from "../logic";

const ctx = { drawImage: vi.fn() };

function stubImage(valid: boolean) {
  class MockImage {
    naturalWidth = valid ? 320 : 0;
    naturalHeight = valid ? 240 : 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => (valid ? this.onload?.() : this.onerror?.()));
    }
  }
  vi.stubGlobal("Image", MockImage);
}

beforeEach(() => {
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([3]));
  ctx.drawImage.mockClear();

  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    callback: BlobCallback,
  ) {
    callback(new Blob([new Uint8Array([8, 9])], { type: "image/png" }));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("bmpToPdf", () => {
  it("rejects an empty list before doing any work", async () => {
    await expect(bmpToPdf([])).rejects.toThrow("Choose at least one BMP image.");
    expect(mocks.imagesToPdf).not.toHaveBeenCalled();
  });

  it("converts BMP files to PNG pages", async () => {
    stubImage(true);

    await bmpToPdf([new File([new Uint8Array([1])], "a.bmp")]);

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([8, 9]), kind: "png" },
    ]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("rejects a file that is not a readable BMP", async () => {
    stubImage(false);

    await expect(
      bmpToPdf([new File([new Uint8Array([1])], "bad.bmp")]),
    ).rejects.toThrow("This file could not be read as a BMP image.");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("reports a canvas failure", async () => {
    stubImage(true);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    await expect(
      bmpToPdf([new File([new Uint8Array([1])], "a.bmp")]),
    ).rejects.toThrow("Canvas is not supported in this browser.");
  });
});
