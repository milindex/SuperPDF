import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  detectPdf: vi.fn(),
  runQpdf: vi.fn(),
}));

vi.mock("@/lib/pdf-detect", () => ({ detectPdf: mocks.detectPdf }));
vi.mock("@/lib/qpdf", () => ({ runQpdf: mocks.runQpdf }));

import { detectUnlockFeasibility, unlockPdf } from "../logic";

beforeEach(() => {
  mocks.detectPdf.mockReset();
  mocks.runQpdf.mockReset();
  mocks.runQpdf.mockResolvedValue(new Uint8Array([5]));
});

describe("detectUnlockFeasibility", () => {
  it("reports an invalid file", async () => {
    mocks.detectPdf.mockResolvedValue({ status: "invalid", error: "Bad PDF" });
    await expect(detectUnlockFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "invalid",
      error: "Bad PDF",
    });
  });

  it("reports an encrypted file", async () => {
    mocks.detectPdf.mockResolvedValue({
      status: "ok",
      encrypted: true,
      pageCount: 4,
    });
    await expect(detectUnlockFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "encrypted",
      pageCount: 4,
    });
  });

  it("reports a file without encryption", async () => {
    mocks.detectPdf.mockResolvedValue({
      status: "ok",
      encrypted: false,
      pageCount: 1,
    });
    await expect(detectUnlockFeasibility(new ArrayBuffer(1))).resolves.toEqual({
      status: "not-encrypted",
      pageCount: 1,
    });
  });
});

describe("unlockPdf", () => {
  it("decrypts without a password argument when none is given", async () => {
    const out = await unlockPdf(new Uint8Array([1]).buffer);

    expect(mocks.runQpdf).toHaveBeenCalledWith(
      ["--decrypt"],
      new Uint8Array([1]),
    );
    expect(Array.from(out)).toEqual([5]);
  });

  it("passes the password to qpdf", async () => {
    await unlockPdf(new ArrayBuffer(1), "secret");
    expect(mocks.runQpdf).toHaveBeenCalledWith(
      ["--decrypt", "--password=secret"],
      expect.any(Uint8Array),
    );
  });

  it("turns engine failures into a friendly error", async () => {
    mocks.runQpdf.mockRejectedValue(new Error("invalid password"));
    await expect(unlockPdf(new ArrayBuffer(1), "wrong")).rejects.toThrow(
      "Unable to unlock. The password is incorrect or missing.",
    );
  });
});
