import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  decode: vi.fn(),
  decodeImage: vi.fn(),
  toRGBA8: vi.fn(),
  imagesToPdf: vi.fn(),
}));

vi.mock("utif", () => ({
  decode: mocks.decode,
  decodeImage: mocks.decodeImage,
  toRGBA8: mocks.toRGBA8,
}));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { tiffToPdf } from "../logic";

const putImageData = vi.fn();
const imageData = { data: new Uint8ClampedArray(4) };
const ctx = {
  createImageData: vi.fn(() => imageData),
  putImageData,
};

beforeEach(() => {
  mocks.decode.mockReset();
  mocks.decodeImage.mockReset();
  mocks.toRGBA8.mockReset();
  mocks.imagesToPdf.mockReset();
  putImageData.mockClear();

  mocks.decode.mockReturnValue([{ width: 1, height: 1 }]);
  mocks.toRGBA8.mockReturnValue(new Uint8Array([1, 2, 3, 4]));
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([6]));

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
});

describe("tiffToPdf", () => {
  it("decodes the first TIFF frame to a PNG page", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "scan.tiff");
    const out = await tiffToPdf([file]);

    expect(mocks.decode).toHaveBeenCalledTimes(1);
    expect(mocks.decodeImage).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      expect.any(Object),
      expect.any(Array),
    );
    expect(imageData.data).toEqual(new Uint8ClampedArray([1, 2, 3, 4]));
    expect(putImageData).toHaveBeenCalledTimes(1);
    const [[images]] = mocks.imagesToPdf.mock.calls as [
      [{ bytes: Uint8Array; kind: string }[]],
    ];
    expect(Array.from(images[0].bytes)).toEqual([65, 66, 67]);
    expect(images[0].kind).toBe("png");
    expect(Array.from(out)).toEqual([6]);
  });

  it("rejects a TIFF with no frames", async () => {
    mocks.decode.mockReturnValue([]);
    await expect(
      tiffToPdf([new File([new Uint8Array([1])], "empty.tiff")]),
    ).rejects.toThrow("No images found in this TIFF.");
    expect(mocks.imagesToPdf).not.toHaveBeenCalled();
  });

  it("reports a canvas failure", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    await expect(
      tiffToPdf([new File([new Uint8Array([1])], "scan.tiff")]),
    ).rejects.toThrow("Canvas is not supported in this browser.");
  });
});
