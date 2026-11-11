import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { webpToPdf } from "../logic";

const ctx = { drawImage: vi.fn() };

function stubImage(dimensions: { width: number; height: number } | null) {
  class MockImage {
    naturalWidth = dimensions?.width ?? 0;
    naturalHeight = dimensions?.height ?? 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() =>
        dimensions ? this.onload?.() : this.onerror?.(),
      );
    }
  }
  vi.stubGlobal("Image", MockImage);
}

beforeEach(() => {
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([1]));
  ctx.drawImage.mockClear();

  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback: BlobCallback) => {
      callback(new Blob([new Uint8Array([65, 66, 67])], { type: "image/png" }));
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("webpToPdf", () => {
  it("rasterises each WEBP to PNG and builds the PDF", async () => {
    stubImage({ width: 640, height: 480 });

    await webpToPdf([new File([new Uint8Array([2])], "photo.webp")]);

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    const [[images]] = mocks.imagesToPdf.mock.calls as [
      [{ bytes: Uint8Array; kind: string }[]],
    ];
    expect(Array.from(images[0].bytes)).toEqual([65, 66, 67]);
    expect(images[0].kind).toBe("png");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("rejects an image that cannot be decoded", async () => {
    stubImage(null);

    await expect(
      webpToPdf([new File([new Uint8Array([2])], "broken.webp")]),
    ).rejects.toThrow('"broken.webp" is not a valid image.');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
