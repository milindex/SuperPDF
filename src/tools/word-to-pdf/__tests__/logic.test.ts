import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  convertToHtml: vi.fn(),
  htmlToPdf: vi.fn(),
}));

vi.mock("mammoth", () => ({
  default: { convertToHtml: mocks.convertToHtml },
}));
vi.mock("@/lib/html-to-pdf", () => ({ htmlToPdf: mocks.htmlToPdf }));

import { wordToPdf } from "../logic";

const file = new File([new Uint8Array([1, 2])], "notes.docx");

beforeEach(() => {
  mocks.convertToHtml.mockReset();
  mocks.htmlToPdf.mockReset();
  mocks.htmlToPdf.mockResolvedValue(new Uint8Array([8]));
});

describe("wordToPdf", () => {
  it("passes the converted HTML to the PDF renderer", async () => {
    mocks.convertToHtml.mockResolvedValue({ value: "<p>Hello</p>", messages: [] });

    const out = await wordToPdf(file);

    const html = mocks.htmlToPdf.mock.calls[0][0] as string;
    expect(mocks.convertToHtml).toHaveBeenCalledWith({
      arrayBuffer: expect.any(ArrayBuffer),
    });
    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain("font-family:sans-serif");
    expect(mocks.htmlToPdf).toHaveBeenCalledWith(html, "word.pdf");
    expect(Array.from(out)).toEqual([8]);
  });

  it("rejects a document with no content", async () => {
    mocks.convertToHtml.mockResolvedValue({ value: "   ", messages: [] });

    await expect(wordToPdf(file)).rejects.toThrow(
      "No content found in this document.",
    );
    expect(mocks.htmlToPdf).not.toHaveBeenCalled();
  });

  it("propagates extraction failures", async () => {
    mocks.convertToHtml.mockRejectedValue(new Error("bad docx"));
    await expect(wordToPdf(file)).rejects.toThrow("bad docx");
  });
});
