import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { svgToPdf } from "../logic";

const ctx = { drawImage: vi.fn() };
let canvasWidth = 0;
let canvasHeight = 0;

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
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      canvasWidth = this.width;
      canvasHeight = this.height;
      return ctx as unknown as CanvasRenderingContext2D;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,QUJD",
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("svgToPdf", () => {
  it("uses the SVG's intrinsic size", async () => {
    stubImage({ width: 640, height: 480 });

    await svgToPdf([new File(["<svg/>"], "logo.svg")]);

    expect(canvasWidth).toBe(640);
    expect(canvasHeight).toBe(480);
    const [[images]] = mocks.imagesToPdf.mock.calls as [
      [{ bytes: Uint8Array; kind: string }[]],
    ];
    expect(Array.from(images[0].bytes)).toEqual([65, 66, 67]);
    expect(images[0].kind).toBe("png");
  });

  it("falls back to 800×600 when the size is unknown", async () => {
    stubImage({ width: 0, height: 0 });

    await svgToPdf([new File(["<svg/>"], "logo.svg")]);

    expect(canvasWidth).toBe(800);
    expect(canvasHeight).toBe(600);
  });

  it("rejects an SVG that cannot be decoded", async () => {
    stubImage(null);

    await expect(
      svgToPdf([new File(["nope"], "bad.svg")]),
    ).rejects.toThrow('"bad.svg" is not a valid SVG.');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
