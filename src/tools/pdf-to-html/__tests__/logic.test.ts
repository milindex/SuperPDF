import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToDataUrl: vi.fn(),
}));

vi.mock("@/lib/pdfjs", () => mocks);

import { pdfToHtml } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToDataUrl.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToDataUrl.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      dataUrl: `data:image/png;base64,IMAGE${page}`,
    }),
  );
});

describe("pdfToHtml", () => {
  it("builds a standalone HTML document with one image per page", async () => {
    const bytes = await pdfToHtml(new ArrayBuffer(4));
    const html = new TextDecoder().decode(bytes);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<meta charset="UTF-8"/>');
    expect(html.match(/<section/g)).toHaveLength(2);
    expect(html).toContain('src="data:image/png;base64,IMAGE1"');
    expect(html).toContain('alt="Page 2"');
    expect(html).toContain("max-width:100%");
    expect(mocks.renderPageToDataUrl).toHaveBeenCalledWith(
      pdf,
      1,
      2,
      "image/png",
    );
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToDataUrl.mockRejectedValue(new Error("boom"));
    await expect(pdfToHtml(new ArrayBuffer(4))).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
