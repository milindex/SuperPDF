import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

const mocks = vi.hoisted(() => ({ htmlToPdf: vi.fn() }));
vi.mock("@/lib/html-to-pdf", () => ({ htmlToPdf: mocks.htmlToPdf }));

import { excelToPdf } from "../logic";

function workbookFile(rows: unknown[][], sheetName = "Data") {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheetName);
  const bytes = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new File([bytes], "book.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

beforeEach(() => {
  mocks.htmlToPdf.mockReset();
  mocks.htmlToPdf.mockResolvedValue(new Uint8Array([3]));
});

describe("excelToPdf", () => {
  it("renders every sheet as an escaped HTML table", async () => {
    const out = await excelToPdf(workbookFile([["Name", "<tag>"], ["A", "1"]]));

    const html = mocks.htmlToPdf.mock.calls[0][0] as string;
    expect(html).toContain("<h3");
    expect(html).toContain("Data");
    expect(html).toContain("&lt;tag&gt;");
    expect(html).not.toContain("<tag>");
    expect(html).toContain("<table");
    expect(html).toContain("<td");
    expect(mocks.htmlToPdf).toHaveBeenCalledWith(html, "excel.pdf");
    expect(Array.from(out)).toEqual([3]);
  });

  it("propagates render failures", async () => {
    mocks.htmlToPdf.mockRejectedValue(new Error("render failed"));
    await expect(excelToPdf(workbookFile([["x"]]))).rejects.toThrow(
      "render failed",
    );
  });
});
