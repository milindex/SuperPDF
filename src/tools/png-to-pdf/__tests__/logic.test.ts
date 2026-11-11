import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { pngToPdf } from "../logic";

beforeEach(() => {
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([7]));
});

describe("pngToPdf", () => {
  it("passes each PNG through in order", async () => {
    const out = await pngToPdf([
      new File([new Uint8Array([1, 2])], "a.png"),
      new File([new Uint8Array([3])], "b.png"),
    ]);

    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([1, 2]), kind: "png" },
      { bytes: new Uint8Array([3]), kind: "png" },
    ]);
    expect(Array.from(out)).toEqual([7]);
  });

  it("handles an empty list", async () => {
    await pngToPdf([]);
    expect(mocks.imagesToPdf).toHaveBeenCalledWith([]);
  });
});
