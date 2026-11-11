import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const chain = {} as {
    set: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    outputPdf: ReturnType<typeof vi.fn>;
  };
  chain.set = vi.fn(() => chain);
  chain.from = vi.fn(() => chain);
  chain.outputPdf = vi.fn(async () => new Blob([new Uint8Array([1, 2])]));
  return { chain, factory: vi.fn(() => chain), fetch: vi.fn() };
});

vi.mock("html2pdf.js", () => ({ default: mocks.factory }));

import { webpageToPdf } from "../logic";

beforeEach(() => {
  mocks.factory.mockClear();
  mocks.chain.set.mockClear();
  mocks.chain.from.mockClear();
  mocks.chain.outputPdf.mockReset();
  mocks.chain.outputPdf.mockResolvedValue(
    new Blob([new Uint8Array([1, 2])]),
  );
  mocks.fetch.mockReset();
  vi.stubGlobal("fetch", mocks.fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("webpageToPdf", () => {
  it("fetches the page with CORS and renders the container", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      text: async () => "<h1>Hello</h1>",
    });

    const out = await webpageToPdf("https://example.com");

    expect(mocks.fetch).toHaveBeenCalledWith("https://example.com", {
      mode: "cors",
    });
    expect(mocks.factory).toHaveBeenCalledTimes(1);
    expect(mocks.chain.set).toHaveBeenCalledWith(
      expect.objectContaining({ jsPDF: expect.objectContaining({ format: "a4" }) }),
    );
    const container = mocks.chain.from.mock.calls[0][0] as HTMLDivElement;
    expect(container.innerHTML).toContain("<h1>Hello</h1>");
    expect(document.body.contains(container)).toBe(false);
    expect(Array.from(out)).toEqual([1, 2]);
  });

  it("reports a failed fetch with the status", async () => {
    mocks.fetch.mockResolvedValue({ ok: false, status: 404, text: async () => "" });

    await expect(webpageToPdf("https://example.com/missing")).rejects.toThrow(
      "Failed to load https://example.com/missing (status 404).",
    );
    expect(mocks.factory).not.toHaveBeenCalled();
  });

  it("removes the container when rendering fails", async () => {
    mocks.fetch.mockResolvedValue({ ok: true, text: async () => "<p>x</p>" });
    mocks.chain.outputPdf.mockRejectedValue(new Error("render failed"));

    await expect(webpageToPdf("https://example.com")).rejects.toThrow(
      "render failed",
    );
    const container = mocks.chain.from.mock.calls[0][0] as HTMLDivElement;
    expect(document.body.contains(container)).toBe(false);
  });
});
