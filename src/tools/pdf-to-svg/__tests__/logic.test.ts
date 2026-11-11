import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadPdf: vi.fn(),
  renderPageToDataUrl: vi.fn(),
}));

vi.mock("@/lib/pdfjs", () => mocks);

import { pdfToSvg } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToDataUrl.mockReset();
  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToDataUrl.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      dataUrl: `data:image/png;base64,IMAGE${page}`,
      width: 600 + page,
      height: 800 + page,
    }),
  );
});

describe("pdfToSvg", () => {
  it("wraps each rendered page in an SVG container", async () => {
    const pages = await pdfToSvg(new ArrayBuffer(4));
    const svg = new TextDecoder().decode(pages[0]);

    expect(pages).toHaveLength(2);
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('width="601" height="801"');
    expect(svg).toContain('viewBox="0 0 601 801"');
    expect(svg).toContain('xlink:href="data:image/png;base64,IMAGE1"');
    expect(new TextDecoder().decode(pages[1])).toContain('width="602"');
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("destroys the document when rendering fails", async () => {
    mocks.renderPageToDataUrl.mockRejectedValue(new Error("boom"));
    await expect(pdfToSvg(new ArrayBuffer(4))).rejects.toThrow("boom");
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
