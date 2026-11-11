import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ runQpdf: vi.fn() }));
vi.mock("@/lib/qpdf", () => ({ runQpdf: mocks.runQpdf }));

import { removeRestrictions } from "../logic";

beforeEach(() => {
  mocks.runQpdf.mockReset();
  mocks.runQpdf.mockResolvedValue(new Uint8Array([9, 9]));
});

describe("removeRestrictions", () => {
  it("runs qpdf --decrypt and returns the output", async () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    const out = await removeRestrictions(buffer);

    expect(mocks.runQpdf).toHaveBeenCalledWith(
      ["--decrypt"],
      new Uint8Array([1, 2, 3]),
    );
    expect(Array.from(out)).toEqual([9, 9]);
  });

  it("propagates engine failures", async () => {
    mocks.runQpdf.mockRejectedValue(new Error("qpdf failed"));
    await expect(removeRestrictions(new ArrayBuffer(1))).rejects.toThrow(
      "qpdf failed",
    );
  });
});
