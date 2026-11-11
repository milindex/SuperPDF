import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { captureFrame, pagesToPdf } from "../logic";

const ctx = {
  fillStyle: "",
  fillRect: vi.fn(),
  drawImage: vi.fn(),
};

beforeEach(() => {
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([4]));
  ctx.fillRect.mockClear();
  ctx.drawImage.mockClear();

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,QUJD",
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("captureFrame", () => {
  it("draws the video frame on a white canvas", () => {
    const video = { videoWidth: 640, videoHeight: 480 } as HTMLVideoElement;
    const page = captureFrame(video);

    expect(page.width).toBe(640);
    expect(page.height).toBe(480);
    expect(Array.from(page.bytes)).toEqual([65, 66, 67]);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 640, 480);
    expect(ctx.drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
  });

  it("falls back to 1280×720 when the video has no size", () => {
    const page = captureFrame({ videoWidth: 0, videoHeight: 0 } as HTMLVideoElement);
    expect(page.width).toBe(1280);
    expect(page.height).toBe(720);
  });

  it("reports a canvas failure", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() =>
      captureFrame({ videoWidth: 1, videoHeight: 1 } as HTMLVideoElement),
    ).toThrow("Canvas is not supported in this browser.");
  });
});

describe("pagesToPdf", () => {
  it("forwards captured pages as PNG images", async () => {
    const out = await pagesToPdf([
      { bytes: new Uint8Array([1]), width: 10, height: 20 },
      { bytes: new Uint8Array([2]), width: 30, height: 40 },
    ]);

    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([1]), kind: "png" },
      { bytes: new Uint8Array([2]), kind: "png" },
    ]);
    expect(Array.from(out)).toEqual([4]);
  });
});
