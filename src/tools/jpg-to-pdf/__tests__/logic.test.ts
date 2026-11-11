import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ imagesToPdf: vi.fn() }));
vi.mock("@/lib/images-to-pdf", () => ({ imagesToPdf: mocks.imagesToPdf }));

import { jpgToPdf } from "../logic";

beforeEach(() => {
  mocks.imagesToPdf.mockReset();
  mocks.imagesToPdf.mockResolvedValue(new Uint8Array([9]));
});

describe("jpgToPdf", () => {
  it("passes each JPEG through in order", async () => {
    const out = await jpgToPdf([
      new File([new Uint8Array([4])], "a.jpg"),
      new File([new Uint8Array([5, 6])], "b.jpg"),
    ]);

    expect(mocks.imagesToPdf).toHaveBeenCalledWith([
      { bytes: new Uint8Array([4]), kind: "jpg" },
      { bytes: new Uint8Array([5, 6]), kind: "jpg" },
    ]);
    expect(Array.from(out)).toEqual([9]);
  });
});
