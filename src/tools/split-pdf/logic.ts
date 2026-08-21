import { PDFDocument } from "pdf-lib";

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