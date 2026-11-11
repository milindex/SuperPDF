import { beforeEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";

const mocks = vi.hoisted(() => ({ loadPdf: vi.fn() }));
vi.mock("@/lib/pdfjs", () => ({ loadPdf: mocks.loadPdf }));

import { pdfToWord } from "../logic";

type Item = { str?: string; hasEOL?: boolean };

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
  pdf.getPage.mockImplementation(async (n: number) => ({
    getTextContent: async () => ({
      items:
        n === 1
          ? ([
              { str: "Hello" },
              { str: " world", hasEOL: true },
              { str: "Second line" },
            ] as Item[])
          : ([{ str: "Page two", hasEOL: true }] as Item[]),
    }),
  }));
});

describe("pdfToWord", () => {
  it("packs extracted text into a .docx", async () => {
    const bytes = await pdfToWord(new ArrayBuffer(4));
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await zip.file("word/document.xml")?.async("string");

    expect(bytes.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(documentXml).toContain("Hello world");
    expect(documentXml).toContain("Second line");
    expect(documentXml).toContain("Page two");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("skips blank lines but still produces a document", async () => {
    pdf.getPage.mockImplementation(async () => ({
      getTextContent: async () => ({ items: [{ str: "   ", hasEOL: true }] }),
    }));

    const bytes = await pdfToWord(new ArrayBuffer(4));
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it("destroys the document when extraction fails", async () => {
    pdf.getPage.mockRejectedValue(new Error("bad page"));
    await expect(pdfToWord(new ArrayBuffer(4))).rejects.toThrow("bad page");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
