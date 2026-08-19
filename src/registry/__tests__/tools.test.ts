import { describe, it, expect } from "vitest";
import { toolsRegistry } from "@/registry/tools";

describe("tools registry", () => {
  it("has unique tool ids", () => {
    const ids = toolsRegistry.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique slugs", () => {
    const slugs = toolsRegistry.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("assigns every tool a valid execution mode", () => {
    for (const tool of toolsRegistry) {
      expect(["sw-routed", "client-direct"]).toContain(tool.mode);
    }
  });

  it("gives every sw-routed tool a swType", () => {
    for (const tool of toolsRegistry) {
      if (tool.mode === "sw-routed") {
        expect(typeof tool.swType).toBe("string");
        expect(tool.swType!.length).toBeGreaterThan(0);
      }
    }
  });
});
