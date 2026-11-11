import { describe, expect, it } from "vitest";
import * as contract from "../sw-contract";

describe("service worker contract", () => {
  const types = Object.entries(contract).filter(
    ([key, value]) => key.endsWith("_TYPE") && typeof value === "string",
  ) as [string, string][];

  it("declares at least one message type", () => {
    expect(types.length).toBeGreaterThan(0);
  });

  it("uses a unique discriminator for every message type", () => {
    const values = types.map(([, value]) => value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("uses non-empty kebab-case discriminators", () => {
    for (const [, value] of types) {
      expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});
