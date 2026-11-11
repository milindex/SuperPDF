import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ loadPdf: vi.fn() }));
vi.mock("@/lib/pdfjs", () => ({ loadPdf: mocks.loadPdf }));

import { pdfToText } from "../logic";

type Item = { str?: string; hasEOL?: boolean; type?: string };

function pageWith(items: Item[]) {
  return { getTextContent: async () => ({ items }) };
}

const pdf = {
  pageCount: 2,
  getPage: vi.fn(),
  destroy: vi.fn(),
};

beforeEach(() => {
  pdf.destroy.mockClear();
  pdf.getPage.mockReset();
  mocks.loadPdf.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  pdf.getPage.mockImplementation(async (n: number) =>
    n === 1
      ? pageWith([
          { str: "Hello" },
          { str: " world", hasEOL: true },
          { str: "Next line" },
        ])
      : pageWith([
          { str: "Page two", hasEOL: true },
          { type: "beginMarkedContent" },
          { str: "" },
          { str: "tail" },
        ]),
  );
});

describe("pdfToText", () => {
  it("reassembles lines and separates pages with a blank line", async () => {
    const text = await pdfToText(new ArrayBuffer(4));

    expect(text).toBe("Hello world\nNext line\n\nPage two\ntail");
    expect(pdf.getPage).toHaveBeenNthCalledWith(1, 1);
    expect(pdf.getPage).toHaveBeenNthCalledWith(2, 2);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("returns an empty string for a PDF with no text", async () => {
    mocks.loadPdf.mockResolvedValue({
      pageCount: 1,
      getPage: async () => pageWith([]),
      destroy: vi.fn(),
    });

    await expect(pdfToText(new ArrayBuffer(1))).resolves.toBe("");
  });

  it("destroys the document when extraction fails", async () => {
    pdf.getPage.mockRejectedValue(new Error("bad page"));
    await expect(pdfToText(new ArrayBuffer(1))).rejects.toThrow("bad page");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
