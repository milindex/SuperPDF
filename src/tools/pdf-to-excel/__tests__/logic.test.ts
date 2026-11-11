import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

const mocks = vi.hoisted(() => ({ loadPdf: vi.fn() }));
vi.mock("@/lib/pdfjs", () => ({ loadPdf: mocks.loadPdf }));

import { pdfToExcel } from "../logic";

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
              { str: "Name" },
              { str: "Value", hasEOL: true },
              { str: "Alpha", hasEOL: true },
            ] as Item[])
          : ([] as Item[]),
    }),
  }));
});

describe("pdfToExcel", () => {
  it("writes one worksheet per page with one row per line", async () => {
    const bytes = await pdfToExcel(new ArrayBuffer(4));
    const wb = XLSX.read(bytes, { type: "array" });

    expect(wb.SheetNames).toEqual(["Page 1", "Page 2"]);
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Page 1"], {
      header: 1,
    });
    expect(rows).toEqual([["NameValue"], ["Alpha"]]);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("writes a placeholder row for an empty page", async () => {
    const bytes = await pdfToExcel(new ArrayBuffer(4));
    const wb = XLSX.read(bytes, { type: "array" });
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Page 2"], {
      header: 1,
    });
    expect(rows).toEqual([[" "]]);
  });

  it("destroys the document when extraction fails", async () => {
    pdf.getPage.mockRejectedValue(new Error("bad page"));
    await expect(pdfToExcel(new ArrayBuffer(4))).rejects.toThrow("bad page");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
