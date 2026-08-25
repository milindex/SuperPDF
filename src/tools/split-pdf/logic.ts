import {
  PDFDocument,
  PDFArray,
  PDFRef,
  PDFName,
  PDFDict,
  PDFString,
  PDFHexString,
} from "pdf-lib";
import type { PDFObject } from "pdf-lib";

/** Parse a 1-based range string like "1-3,5,8-10" into { start, end } ranges. */
export function parseRanges(
  input: string,
): { start: number; end: number }[] {
  return input
    .split(",")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const [startStr, endStr] = seg.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : start;
      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 1 ||
        end < 1 ||
        end < start
      ) {
        return null;
      }
      return { start, end };
    })
    .filter((r): r is { start: number; end: number } => r !== null);
}

/**
 * Split a PDF into multiple documents based on 1-based page ranges like
 * "1-2,4,6-7". Returns one document per range.
 */
export async function splitPdfByRange(
  buffer: ArrayBuffer,
  rangeString: string,
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(buffer);
  const ranges = parseRanges(rangeString);
  const outputs: Uint8Array[] = [];
  for (const range of ranges) {
    const splitDoc = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (
      let p = range.start - 1;
      p < range.end && p < srcPdf.getPageCount();
      p++
    ) {
      pageIndices.push(p);
    }
    const pages = await splitDoc.copyPages(srcPdf, pageIndices);
    pages.forEach((page) => splitDoc.addPage(page));
    outputs.push(await splitDoc.save());
  }
  return outputs;
}

/**
 * Split a PDF into a single document containing only the selected pages
 * (1-based page numbers).
 */
export async function splitPdfByPages(
  buffer: ArrayBuffer,
  pageNumbers: number[],
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(buffer);
  const splitDoc = await PDFDocument.create();
  const validPages = pageNumbers
    .map((n) => n - 1)
    .filter((idx) => idx >= 0 && idx < srcPdf.getPageCount());
  if (validPages.length === 0) return [];
  const pages = await splitDoc.copyPages(srcPdf, validPages);
  pages.forEach((page) => splitDoc.addPage(page));
  return [await splitDoc.save()];
}

/**
 * Split a PDF into multiple documents, each with a max size in bytes.
 * Starts a new chunk when adding a page would exceed the target size.
 */
export async function splitPdfBySize(
  buffer: ArrayBuffer,
  maxSizeBytes: number,
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(buffer);
  const totalPages = srcPdf.getPageCount();
  const outputs: Uint8Array[] = [];
  let currentChunk: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    currentChunk.push(i);

    const chunkDoc = await PDFDocument.create();
    const pages = await chunkDoc.copyPages(srcPdf, currentChunk);
    pages.forEach((page) => chunkDoc.addPage(page));
    const chunkBytes = await chunkDoc.save();

    if (chunkBytes.byteLength > maxSizeBytes && currentChunk.length > 1) {
      currentChunk.pop();
      const prevDoc = await PDFDocument.create();
      const prevPages = await prevDoc.copyPages(srcPdf, currentChunk);
      prevPages.forEach((page) => prevDoc.addPage(page));
      outputs.push(await prevDoc.save());
      currentChunk = [i];
    }
  }

  if (currentChunk.length > 0) {
    const lastDoc = await PDFDocument.create();
    const lastPages = await lastDoc.copyPages(srcPdf, currentChunk);
    lastPages.forEach((page) => lastDoc.addPage(page));
    outputs.push(await lastDoc.save());
  }
  return outputs;
}

/** Utility: get the total page count of a PDF buffer. */
export async function getPageCount(buffer: ArrayBuffer): Promise<number> {
  const srcPdf = await PDFDocument.load(buffer);
  return srcPdf.getPageCount();
}

/** Build a fresh PDF from the given 0-based page indices; null when empty. */
async function buildDocFromIndices(
  srcPdf: PDFDocument,
  indices: number[],
): Promise<Uint8Array | null> {
  if (indices.length === 0) return null;
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(srcPdf, indices);
  pages.forEach((page) => doc.addPage(page));
  return doc.save();
}

/**
 * Split a PDF into two documents: 1-based odd pages and 1-based even pages
 * (PDFsam-style). Empty halves are dropped.
 */
export async function splitPdfByEvenOdd(
  buffer: ArrayBuffer,
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(buffer);
  const odd: number[] = [];
  const even: number[] = [];
  for (let i = 0; i < srcPdf.getPageCount(); i++) {
    if (i % 2 === 0) odd.push(i);
    else even.push(i);
  }
  const outputs: Uint8Array[] = [];
  for (const doc of [odd, even]) {
    const bytes = await buildDocFromIndices(srcPdf, doc);
    if (bytes) outputs.push(bytes);
  }
  return outputs;
}

/**
 * Split a PDF into documents of at most `n` consecutive pages each.
 */
export async function splitPdfEveryN(
  buffer: ArrayBuffer,
  n: number,
): Promise<Uint8Array[]> {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("Number of pages per split must be a positive integer.");
  }
  const srcPdf = await PDFDocument.load(buffer);
  const totalPages = srcPdf.getPageCount();
  const outputs: Uint8Array[] = [];
  for (let start = 0; start < totalPages; start += n) {
    const indices: number[] = [];
    for (let p = start; p < Math.min(start + n, totalPages); p++) indices.push(p);
    const bytes = await buildDocFromIndices(srcPdf, indices);
    if (bytes) outputs.push(bytes);
  }
  return outputs;
}

/** Resolve a page ref to a 0-based index, or undefined if it's not a page. */
function safePageIndex(doc: PDFDocument, ref: PDFRef): number | undefined {
  const pages = doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pageRef = pages[i].ref;
    if (
      pageRef.objectNumber === ref.objectNumber &&
      pageRef.generationNumber === ref.generationNumber
    ) {
      return i;
    }
  }
  return undefined;
}

/**
 * Walk a PDF name tree (used for `/Dests`) looking for `name`, returning the
 * associated value object. Supports both leaf `/Names` arrays and `Kids` nodes.
 */
function findInNameTree(
  doc: PDFDocument,
  node: PDFDict,
  name: PDFName,
): PDFObject | undefined {
  const names = node.lookupMaybe(PDFName.of("Names"), PDFArray);
  if (names) {
    for (let i = 0; i + 1 < names.size(); i += 2) {
      const key = names.get(i);
      if (key instanceof PDFName && key.asString() === name.asString()) {
        return names.get(i + 1);
      }
    }
  }
  const kids = node.lookupMaybe(PDFName.of("Kids"), PDFArray);
  if (kids) {
    for (let i = 0; i < kids.size(); i++) {
      const kid = kids.get(i);
      if (!(kid instanceof PDFRef)) continue;
      const child = doc.context.lookupMaybe(kid, PDFDict);
      if (!child) continue;
      const limits = child.lookupMaybe(PDFName.of("Limits"), PDFArray);
      if (limits && limits.size() >= 2) {
        const lo = limits.get(0);
        const hi = limits.get(1);
        if (lo instanceof PDFName && hi instanceof PDFName) {
          const n = name.asString();
          if (n < lo.asString() || n > hi.asString()) continue;
        }
      }
      const found = findInNameTree(doc, child, name);
      if (found) return found;
    }
  }
  return undefined;
}

/** Resolve a named destination (string key in the catalog `/Dests` tree). */
function namedDestPageIndex(
  doc: PDFDocument,
  name: PDFName,
): number | undefined {
  const dests = doc.catalog.lookup(PDFName.of("Dests"));
  let root: PDFDict | undefined;
  if (dests instanceof PDFRef) {
    root = doc.context.lookupMaybe(dests, PDFDict);
  } else if (dests instanceof PDFDict) {
    root = dests;
  }
  if (!root) return undefined;
  const value = findInNameTree(doc, root, name);
  return value ? pageIndexFromDest(doc, value) : undefined;
}

/** Resolve a destination object (array, ref, or named) to a page index. */
function pageIndexFromDest(
  doc: PDFDocument,
  value: PDFObject,
): number | undefined {
  if (value instanceof PDFArray && value.size() > 0) {
    const first = value.get(0);
    if (first instanceof PDFRef) return safePageIndex(doc, first);
    return undefined;
  }
  if (value instanceof PDFRef) {
    const arr = doc.context.lookupMaybe(value, PDFArray);
    if (arr) return pageIndexFromDest(doc, arr);
    return safePageIndex(doc, value);
  }
  let name: PDFName | undefined;
  if (value instanceof PDFName) name = value;
  else if (value instanceof PDFString) name = PDFName.of(value.decodeText());
  else if (value instanceof PDFHexString) name = PDFName.of(value.decodeText());
  return name ? namedDestPageIndex(doc, name) : undefined;
}

/** Resolve an outline item dict's destination to a page index, if possible. */
function outlineItemPageIndex(
  doc: PDFDocument,
  item: PDFDict,
): number | undefined {
  const dest = item.lookup(PDFName.of("Dest"));
  if (dest) {
    const idx = pageIndexFromDest(doc, dest);
    if (idx !== undefined) return idx;
  }
  const action = item.lookupMaybe(PDFName.of("A"), PDFDict);
  if (action) {
    const d = action.lookup(PDFName.of("D"));
    if (d) {
      const idx = pageIndexFromDest(doc, d);
      if (idx !== undefined) return idx;
    }
  }
  return undefined;
}

/**
 * Read top-level outline (bookmark) items from the document's `/Outlines`
 * tree via its low-level objects. pdf-lib exposes no outline API, so we parse
 * `/First`/`/Next` directly.
 */
function readTopLevelBookmarks(
  doc: PDFDocument,
): { title: string; pageIndex?: number }[] {
  const outlines = doc.catalog.lookup(PDFName.of("Outlines"));
  let root: PDFDict | undefined;
  if (outlines instanceof PDFRef) {
    root = doc.context.lookupMaybe(outlines, PDFDict);
  } else if (outlines instanceof PDFDict) {
    root = outlines;
  }
  if (!root) return [];

  const items: { title: string; pageIndex?: number }[] = [];
  const first = root.get(PDFName.of("First"));
  let current: PDFDict | undefined;
  if (first instanceof PDFRef) {
    current = doc.context.lookupMaybe(first, PDFDict);
  } else if (first instanceof PDFDict) {
    current = first;
  }
  while (current) {
    const titleObj = current.lookup(PDFName.of("Title"));
    const title =
      titleObj instanceof PDFString || titleObj instanceof PDFHexString
        ? titleObj.decodeText()
        : undefined;
    const pageIndex = outlineItemPageIndex(doc, current);
    if (title) items.push({ title, pageIndex });
    const next = current.get(PDFName.of("Next"));
    if (next instanceof PDFRef) {
      current = doc.context.lookupMaybe(next, PDFDict);
    } else if (next instanceof PDFDict) {
      current = next;
    } else {
      current = undefined;
    }
  }
  return items;
}

/**
 * Split a PDF at each top-level bookmark (PDF outline) into one document per
 * section. Sections with no pages are skipped. Throws when no bookmark can be
 * resolved to a page.
 */
export async function splitPdfByBookmarks(
  buffer: ArrayBuffer,
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(buffer);
  const bookmarks = readTopLevelBookmarks(srcPdf);
  const boundaries: number[] = [];
  for (const bookmark of bookmarks) {
    const idx = bookmark.pageIndex;
    if (idx === undefined) continue;
    if (idx < 0 || idx >= srcPdf.getPageCount()) continue;
    if (boundaries[boundaries.length - 1] === idx) continue;
    boundaries.push(idx);
  }
  if (boundaries.length === 0) {
    throw new Error("No bookmarks found in this PDF.");
  }

  const outputs: Uint8Array[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end =
      i + 1 < boundaries.length
        ? boundaries[i + 1] - 1
        : srcPdf.getPageCount() - 1;
    const indices: number[] = [];
    for (let p = start; p <= end; p++) indices.push(p);
    const bytes = await buildDocFromIndices(srcPdf, indices);
    if (bytes) outputs.push(bytes);
  }
  return outputs;
}