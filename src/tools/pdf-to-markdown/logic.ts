"use client";

/**
 * Convert a PDF to Markdown. The conversion pipeline is split into pure,
 * unit-testable functions (`groupLines`, `classifyLines`, `blocksToMarkdown`)
 * that operate on plain text-item data, plus a thin pdf.js wrapper
 * (`pdfToMarkdown`) that feeds real page content into them.
 */

export interface TextItemLike {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MarkdownBlock {
  kind: "heading" | "paragraph" | "table";
  level?: number;
  text?: string;
  table?: string[][];
}

/** Two text-space units: enough to separate items but not paragraphs. */
const LINE_TOLERANCE = 2;
/** Columns closer than this (in text units) are treated as one column. */
const X_TOLERANCE = 2;

/**
 * Escape Markdown special characters so extracted text can't be interpreted
 * as formatting or injected HTML.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]<>#|~]/g, (m) => `\\${m}`);
}

/**
 * Group a page's text items into lines (rows of roughly-equal y), ordered
 * top-to-bottom then left-to-right.
 */
export function groupLines(items: TextItemLike[]): TextItemLike[][] {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(b.y - a.y) > LINE_TOLERANCE) return b.y - a.y;
    return a.x - b.x;
  });
  const lines: TextItemLike[][] = [];
  for (const item of sorted) {
    const current = lines[lines.length - 1];
    if (current && Math.abs(current[0].y - item.y) <= LINE_TOLERANCE) {
      current.push(item);
    } else {
      lines.push([item]);
    }
  }
  return lines;
}

/**
 * Join a line's items into a single string, inserting a space where the gap
 * between glyph runs is wider than expected for the font size. This keeps
 * separate words apart without splitting them.
 */
export function joinLine(line: TextItemLike[]): string {
  if (line.length === 0) return "";
  let out = line[0].str;
  for (let i = 1; i < line.length; i++) {
    const prev = line[i - 1];
    const cur = line[i];
    const gap = cur.x - (prev.x + prev.width);
    if (gap > Math.max(1, prev.height * 0.25)) out += " ";
    out += cur.str;
  }
  return out.trim();
}

/** Median font size of the page's items — the baseline for heading detection. */
function medianHeight(items: TextItemLike[]): number {
  const heights = items.map((i) => i.height).filter((h) => h > 0).sort((a, b) => a - b);
  if (heights.length === 0) return 0;
  const mid = Math.floor(heights.length / 2);
  return heights.length % 2 === 0 ? (heights[mid - 1] + heights[mid]) / 2 : heights[mid];
}

/** Map a line's font size to a heading level (1–3), or null for body text. */
function headingLevel(font: number, bodyFont: number): number | null {
  if (font <= 0 || bodyFont <= 0) return null;
  const ratio = font / bodyFont;
  if (ratio >= 1.9) return 1;
  if (ratio >= 1.45) return 2;
  if (ratio >= 1.18) return 3;
  return null;
}

/** Cluster item x-positions into column boundaries; null if only one column. */
function columnBuckets(lines: TextItemLike[][]): number[] | null {
  const xs = lines
    .flat()
    .map((i) => i.x)
    .sort((a, b) => a - b);
  const buckets: number[] = [];
  for (const x of xs) {
    const last = buckets[buckets.length - 1];
    if (last === undefined || x - last > X_TOLERANCE) buckets.push(x);
  }
  return buckets.length >= 2 ? buckets : null;
}

/**
 * Rebuild a table grid from lines using shared column boundaries. Returns
 * null when any line can't be mapped to exactly one item per column.
 */
function alignToColumns(
  lines: TextItemLike[][],
  buckets: number[],
): string[][] | null {
  const rows: string[][] = [];
  for (const line of lines) {
    const cells: (string | null)[] = buckets.map(() => null);
    for (const item of line) {
      let idx = -1;
      for (let b = 0; b < buckets.length; b++) {
        if (Math.abs(item.x - buckets[b]) <= X_TOLERANCE) {
          idx = b;
          break;
        }
      }
      if (idx === -1) return null;
      cells[idx] = (cells[idx] ?? "") + item.str;
    }
    if (cells.some((c) => c === null)) return null;
    rows.push(cells.map((c) => (c as string).trim()));
  }
  return rows;
}

/**
 * Detect a tabular region: several consecutive multi-item lines whose column
 * positions align across every row. Conservative — returns null unless every
 * line has exactly one cell per column.
 */
export function detectTable(lines: TextItemLike[][]): string[][] | null {
  if (lines.length < 2) return null;
  if (lines.some((l) => l.length < 2)) return null;
  const buckets = columnBuckets(lines);
  if (!buckets) return null;
  const rows = alignToColumns(lines, buckets);
  if (!rows) return null;
  if (rows.some((r) => r.some((c) => !c))) return null;
  return rows;
}

/**
 * Classify a page's lines into heading / paragraph / table blocks, applying
 * font-size-based heading detection and the conservative table heuristic.
 */
export function classifyLines(lines: TextItemLike[][]): MarkdownBlock[] {
  const bodyFont = medianHeight(lines.flat());
  const blocks: MarkdownBlock[] = [];
  let run: TextItemLike[][] = [];

  const flushRun = () => {
    if (run.length === 0) return;
    const table = detectTable(run);
    if (table) {
      blocks.push({ kind: "table", table });
    } else {
      const text = run
        .map((line) => joinLine(line))
        .filter(Boolean)
        .join("\n");
      if (text.trim()) blocks.push({ kind: "paragraph", text });
    }
    run = [];
  };

  for (const line of lines) {
    const font = Math.max(...line.map((i) => i.height).filter((h) => h > 0), 0);
    const level = headingLevel(font, bodyFont);
    if (level !== null) {
      flushRun();
      const text = joinLine(line);
      if (text) blocks.push({ kind: "heading", level, text });
    } else {
      run.push(line);
    }
  }
  flushRun();
  return blocks;
}

function renderTable(rows: string[][]): string {
  const widths = rows[0].map((_, i) =>
    Math.max(...rows.map((r) => escapeMarkdown(r[i] ?? "").length)),
  );
  const fmt = (r: string[]) =>
    r.map((c, i) => escapeMarkdown(c ?? "").padEnd(widths[i])).join(" | ");
  const lines = [
    fmt(rows[0]),
    rows[0].map(() => "---").join(" | "),
    ...rows.slice(1).map(fmt),
  ];
  return lines.map((l) => `| ${l} |`).join("\n");
}

/** Render a page's blocks to Markdown text. */
export function blocksToMarkdown(blocks: MarkdownBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "heading") {
        return `${"#".repeat(block.level ?? 1)} ${escapeMarkdown(block.text ?? "")}`;
      }
      if (block.kind === "paragraph") {
        return escapeMarkdown(block.text ?? "");
      }
      return block.table ? renderTable(block.table) : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Convert a PDF buffer to Markdown text, fully client-side. Each page's text
 * layer is extracted with pdf.js, classified into blocks, and rendered to
 * Markdown with page separators.
 */
export async function pdfToMarkdown(buffer: ArrayBuffer): Promise<string> {
  const { loadPdf } = await import("@/lib/pdfjs");
  const pdf = await loadPdf(buffer);
  try {
    const parts: string[] = [];
    for (let n = 1; n <= pdf.pageCount; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const items: TextItemLike[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const transform = item.transform ?? [];
        items.push({
          str: item.str,
          x: transform[4] ?? 0,
          y: transform[5] ?? 0,
          width: item.width ?? 0,
          height: item.height ?? 0,
        });
      }
      const md = blocksToMarkdown(classifyLines(groupLines(items)));
      parts.push(`<!-- Page ${n} -->\n\n${md}`);
    }
    return parts.join("\n\n");
  } finally {
    pdf.destroy();
  }
}