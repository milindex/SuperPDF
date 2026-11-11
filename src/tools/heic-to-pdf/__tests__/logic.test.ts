import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));

vi.mock("heic2any", () => ({ default: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import heic2any from "heic2any";
import { heicToPdf } from "../logic";

const heicMock = vi.mocked(heic2any);

beforeEach(() => {
  heicMock.mockReset();
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([2]));
});

describe("heicToPdf", () => {
  it("converts a HEIC blob to PNG", async () => {
    heicMock.mockResolvedValue(
      new Blob([new Uint8Array([4, 5])], { type: "image/png" }),
    );

    const out = await heicToPdf([new File([new Uint8Array([1])], "a.heic")]);

    expect(heicMock).toHaveBeenCalledTimes(1);
    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([4, 5]), kind: "png" },
    ]);
    expect(Array.from(out)).toEqual([2]);
  });

  it("takes the first blob when heic2any returns a list", async () => {
    heicMock.mockResolvedValue([
      new Blob([new Uint8Array([6])]),
      new Blob([new Uint8Array([7])]),
    ]);

    await heicToPdf([new File([new Uint8Array([1])], "a.heic")]);

    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([6]), kind: "png" },
    ]);
  });

  it("propagates decode failures", async () => {
    heicMock.mockRejectedValue(new Error("bad heic"));
    await expect(
      heicToPdf([new File([new Uint8Array([1])], "a.heic")]),
    ).rejects.toThrow("bad heic");
  });
});
