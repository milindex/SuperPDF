import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const worker = {
    loadLanguage: vi.fn(),
    initialize: vi.fn(),
    recognize: vi.fn(),
    terminate: vi.fn(),
  };
  return {
    loadPdf: vi.fn(),
    renderPageToBlob: vi.fn(),
    createWorker: vi.fn(),
    worker,
  };
});

vi.mock("@/lib/pdfjs", () => ({
  loadPdf: mocks.loadPdf,
  renderPageToBlob: mocks.renderPageToBlob,
}));
vi.mock("tesseract.js", () => ({ createWorker: mocks.createWorker }));

import { ocrPdf } from "../logic";

const pdf = { pageCount: 2, destroy: vi.fn() };

beforeEach(() => {
  pdf.destroy.mockClear();
  mocks.loadPdf.mockReset();
  mocks.renderPageToBlob.mockReset();
  mocks.createWorker.mockReset();
  mocks.worker.loadLanguage.mockReset();
  mocks.worker.initialize.mockReset();
  mocks.worker.recognize.mockReset();
  mocks.worker.terminate.mockReset();

  mocks.loadPdf.mockResolvedValue(pdf);
  mocks.renderPageToBlob.mockImplementation(
    async (_pdf: unknown, page: number) => ({
      blob: new Blob([`P${page}`], { type: "image/png" }),
    }),
  );
  mocks.createWorker.mockResolvedValue(mocks.worker);
  mocks.worker.recognize
    .mockResolvedValueOnce({ data: { text: " First page " } })
    .mockResolvedValueOnce({ data: { text: "Second page\n" } });
});

describe("ocrPdf", () => {
  it("recognises every page and labels the output", async () => {
    const onProgress = vi.fn();
    const text = await ocrPdf(new ArrayBuffer(4), onProgress);

    expect(text).toBe(
      "=== Page 1 ===\nFirst page\n\n=== Page 2 ===\nSecond page",
    );
    expect(mocks.worker.loadLanguage).toHaveBeenCalledWith("eng");
    expect(mocks.worker.initialize).toHaveBeenCalledWith("eng");
    expect(mocks.worker.recognize).toHaveBeenCalledTimes(2);
    expect(mocks.worker.recognize.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(onProgress.mock.calls).toEqual([
      [1, 2],
      [2, 2],
    ]);
    expect(mocks.worker.terminate).toHaveBeenCalledTimes(1);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });

  it("cleans up the worker and document when recognition fails", async () => {
    mocks.worker.recognize.mockReset();
    mocks.worker.recognize.mockRejectedValue(new Error("ocr failed"));

    await expect(ocrPdf(new ArrayBuffer(4))).rejects.toThrow("ocr failed");
    expect(mocks.worker.terminate).toHaveBeenCalledTimes(1);
    expect(pdf.destroy).toHaveBeenCalledTimes(1);
  });
});
