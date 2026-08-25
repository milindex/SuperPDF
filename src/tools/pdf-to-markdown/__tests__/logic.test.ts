import { describe, it, expect } from "vitest";
import {
  escapeMarkdown,
  groupLines,
  joinLine,
  detectTable,
  classifyLines,
  blocksToMarkdown,
  type TextItemLike,
} from "../logic";

const item = (
  str: string,
  x: number,
  y: number,
  opts: Partial<TextItemLike> = {},
): TextItemLike => ({
  str,
  x,
  y,
  width: str.length * 10,
  height: 10,
  ...opts,
});

describe("escapeMarkdown", () => {
  it("escapes markdown and HTML special characters", () => {
    expect(escapeMarkdown("a*b [c] (d) <b> # x | y")).toBe(
      "a\\*b \\[c\\] (d) \\<b\\> \\# x \\| y",
    );
  });
});

describe("groupLines", () => {
  it("groups items on the same row and orders rows top-to-bottom", () => {
    const lines = groupLines([
      item("b", 10, 100),
      item("a", 0, 100),
      item("c", 0, 50),
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].map((i) => i.str)).toEqual(["a", "b"]);
    expect(lines[1].map((i) => i.str)).toEqual(["c"]);
  });

  it("puts slightly-off rows into separate lines", () => {
    const lines = groupLines([item("top", 0, 100), item("bot", 0, 80)]);
    expect(lines).toHaveLength(2);
  });
});

describe("joinLine", () => {
  it("inserts a space between wide gaps but not within a word", () => {
    expect(joinLine([item("Hel", 0, 0, { width: 24 }), item("lo", 26, 0)])).toBe("Hello");
    expect(joinLine([item("foo", 0, 0, { width: 30 }), item("bar", 60, 0)])).toBe("foo bar");
  });
});

describe("detectTable", () => {
  it("detects a two-column grid", () => {
    const rows = [
      [item("A", 0, 100), item("1", 100, 100)],
      [item("B", 0, 80), item("2", 100, 80)],
      [item("C", 0, 60), item("3", 100, 60)],
    ];
    expect(detectTable(rows)).toEqual([
      ["A", "1"],
      ["B", "2"],
      ["C", "3"],
    ]);
  });

  it("returns null for lines that do not align to shared columns", () => {
    const rows = [
      [item("long text", 0, 100), item("1", 120, 100)],
      [item("B", 0, 80), item("22", 90, 80)],
    ];
    expect(detectTable(rows)).toBeNull();
  });
});

describe("classifyLines + blocksToMarkdown", () => {
  it("emits headings from large fonts and body text as paragraphs", () => {
    const lines = groupLines([
      item("Title", 0, 240, { height: 24 }),
      item("First paragraph line.", 0, 180, { height: 10 }),
      item("Second paragraph line.", 0, 160, { height: 10 }),
      item("Third paragraph line.", 0, 140, { height: 10 }),
    ]);
    const md = blocksToMarkdown(classifyLines(lines));
    expect(md).toBe(
      "# Title\n\nFirst paragraph line.\nSecond paragraph line.\nThird paragraph line.",
    );
  });

  it("renders a table region as a pipe table", () => {
    const lines = groupLines([
      item("Name", 0, 200),
      item("Value", 100, 200),
      item("x", 0, 180),
      item("1", 100, 180),
      item("y", 0, 160),
      item("2", 100, 160),
    ]);
    const md = blocksToMarkdown(classifyLines(lines));
    expect(md).toContain("| Name | Value |");
    expect(md).toContain("| --- | --- |");
    expect(md).toMatch(/\| x\s* \| 1\s* \|/);
  });

  it("escapes markdown characters in extracted text", () => {
    const lines = groupLines([item("100% #done", 0, 100, { height: 10 })]);
    const md = blocksToMarkdown(classifyLines(lines));
    expect(md).toContain("100% \\#done");
  });
});