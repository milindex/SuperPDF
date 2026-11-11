import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  detectPdf: vi.fn(),
  runQpdf: vi.fn(),
}));

vi.mock("@/lib/pdf-detect", () => ({ detectPdf: mocks.detectPdf }));
vi.mock("@/lib/qpdf", () => ({ runQpdf: mocks.runQpdf }));

import { detectProtectFeasibility, protectPdf } from "../logic";

beforeEach(() => {
  mocks.detectPdf.mockReset();
  mocks.runQpdf.mockReset();
  mocks.runQpdf.mockResolvedValue(new Uint8Array([7]));
});

describe("detectProtectFeasibility", () => {
  it("reports an invalid file", async () => {
    mocks.detectPdf.mockResolvedValue({ status: "invalid", error: "Not a PDF" });
    await expect(detectProtectFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "invalid",
      error: "Not a PDF",
    });
  });

  it("reports an already encrypted file", async () => {
    mocks.detectPdf.mockResolvedValue({
      status: "ok",
      encrypted: true,
      pageCount: 3,
    });
    await expect(detectProtectFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "already-encrypted",
      pageCount: 3,
    });
  });

  it("reports a protectable file", async () => {
    mocks.detectPdf.mockResolvedValue({
      status: "ok",
      encrypted: false,
      pageCount: 2,
    });
    await expect(detectProtectFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "protectable",
      pageCount: 2,
    });
  });

  it("falls back to zero pages when the count is missing", async () => {
    mocks.detectPdf.mockResolvedValue({ status: "ok", encrypted: true });
    await expect(detectProtectFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "already-encrypted",
      pageCount: 0,
    });
  });
});

describe("protectPdf", () => {
  it("rejects an empty password without calling qpdf", async () => {
    await expect(protectPdf(new ArrayBuffer(1), "")).rejects.toThrow(
      "A password is required.",
    );
    expect(mocks.runQpdf).not.toHaveBeenCalled();
  });

  it("encrypts with 256-bit AES using the same user and owner password", async () => {
    const out = await protectPdf(new Uint8Array([1, 2]).buffer, "hunter2");

    expect(mocks.runQpdf).toHaveBeenCalledWith(
      ["--encrypt", "hunter2", "hunter2", "256"],
      new Uint8Array([1, 2]),
    );
    expect(Array.from(out)).toEqual([7]);
  });

  it("propagates encryption failures", async () => {
    mocks.runQpdf.mockRejectedValue(new Error("bad key"));
    await expect(protectPdf(new ArrayBuffer(1), "pw")).rejects.toThrow("bad key");
  });
});
