import { describe, expect, it } from "vitest";
import { collectTransferables } from "../sw-client";

describe("collectTransferables", () => {
  it("collects a single ArrayBuffer from an object", () => {
    const buffer = new ArrayBuffer(4);
    const result = collectTransferables({ buffer });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(buffer);
  });

  it("collects every buffer in an array", () => {
    const a = new ArrayBuffer(4);
    const b = new ArrayBuffer(8);
    const result = collectTransferables({ buffers: [a, b] });
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it("collects the underlying buffer of an ArrayBufferView", () => {
    const buffer = new ArrayBuffer(16);
    const view = new Uint8Array(buffer, 4, 8);
    const result = collectTransferables(view);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(buffer);
  });

  it("recurses through nested objects and arrays", () => {
    const a = new ArrayBuffer(4);
    const b = new ArrayBuffer(8);
    const payload = { outer: { inner: [a, { deep: new Uint8Array(b) }] } };
    const result = collectTransferables(payload);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it("deduplicates a buffer referenced more than once", () => {
    const shared = new ArrayBuffer(4);
    const other = new ArrayBuffer(8);
    const payload = { a: shared, b: [shared, new Uint8Array(other), other] };
    const result = collectTransferables(payload);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(shared);
    expect(result[1]).toBe(other);
  });

  it("ignores non-binary values", () => {
    const buffer = new ArrayBuffer(4);
    const payload = {
      buffer,
      string: "hello",
      number: 42,
      bool: true,
      nil: null,
      undef: undefined,
      date: new Date(0),
    };
    const result = collectTransferables(payload);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(buffer);
  });
});
