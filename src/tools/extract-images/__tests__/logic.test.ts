import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OPS = vi.hoisted(() => ({
  paintImageXObject: 101,
  paintInlineImageXObject: 102,
}));

const mocks = vi.hoisted(() => ({ loadPdf: vi.fn() }));

vi.mock("pdfjs-dist", () => ({ OPS }));
vi.mock("@/lib/pdfjs", () => ({ loadPdf: mocks.loadPdf }));

import { extractImages } from "../logic";

const ctx = { drawImage: vi.fn() };

function fakePage(objs: Record<string, unknown>, failing: string[] = []) {
  return {
    getOperatorList: async () => ({
      fnArray: [
        OPS.paintImageXObject,
        999,
        OPS.paintInlineImageXObject,
        OPS.paintImageXObject,
        OPS.paintImageXObject,
      ],
      argsArray: [["good"], [], ["inline"], ["zero"], ["broken"]],
    }),
    objs: {
      get: async (name: string) => {
        if (failing.includes(name)) throw new Error("decode failed");
        return objs[name];
      },
    },
  };
}

const pdf = { pageCount: 1, getPage: vi.fn(), destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  pdf.getPage.mockReset();
  mocks.loadPdf.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  ctx.drawImage.mockClear();

  pdf.getPage.mockResolvedValue(
    fakePage({
      good: { width: 10, height: 20, bitmap: {} },
      inline: { width: 2, height: 3, bitmap: {} },
      zero: { width: 0, height: 0, bitmap: {} },
    }, ["broken"]),
  );

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

describe("extractImages", () => {
  it("extracts decodable images and skips the rest", async () => {
    const images = await extractImages(new ArrayBuffer(4));

    expect(images).toHaveLength(2);
    expect(images[0]).toMatchObject({
      name: "image-1-0.png",
      width: 10,
      height: 20,
      mimeType: "image/png",
    });
    expect(images[1].name).toBe("image-1-2.png");
    expect(new TextDecoder().decode(images[0].bytes)).toBe("ABC");
    expect(ctx.drawImage).toHaveBeenCalledTimes(2);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("skips images without a bitmap", async () => {
    pdf.getPage.mockResolvedValue(
      fakePage({
        good: { width: 10, height: 20 },
        inline: { width: 2, height: 3 },
        zero: { width: 0, height: 0 },
      }),
    );

    await expect(extractImages(new ArrayBuffer(4))).resolves.toEqual([]);
  });

  it("destroys the document when page extraction fails", async () => {
    pdf.getPage.mockRejectedValue(new Error("bad page"));
    await expect(extractImages(new ArrayBuffer(4))).rejects.toThrow("bad page");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
