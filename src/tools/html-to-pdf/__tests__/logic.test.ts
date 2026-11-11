import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ htmlToPdf: vi.fn() }));
vi.mock("@/lib/html-to-pdf", () => ({ htmlToPdf: mocks.htmlToPdf }));

import { htmlFileToPdf } from "../logic";

const file = (contents: string) =>
  new File([contents], "page.html", { type: "text/html" });

beforeEach(() => {
  mocks.htmlToPdf.mockReset();
  mocks.htmlToPdf.mockResolvedValue(new Uint8Array([1, 2]));
});

describe("htmlFileToPdf", () => {
  it("converts a non-empty HTML file", async () => {
    const out = await htmlFileToPdf(file("<h1>Hello</h1>"));

    expect(mocks.htmlToPdf).toHaveBeenCalledWith(
      "<h1>Hello</h1>",
      "document.pdf",
    );
    expect(Array.from(out)).toEqual([1, 2]);
  });

  it("rejects an empty file without rendering", async () => {
    await expect(htmlFileToPdf(file("   \n"))).rejects.toThrow(
      "The HTML file is empty.",
    );
    expect(mocks.htmlToPdf).not.toHaveBeenCalled();
  });

  it("propagates render failures", async () => {
    mocks.htmlToPdf.mockRejectedValue(new Error("render failed"));
    await expect(htmlFileToPdf(file("<p>x</p>"))).rejects.toThrow(
      "render failed",
    );
  });
});
