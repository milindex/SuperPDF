/**
 * Shared message contract between the UI (`sendToSw()`) and the Service
 * Worker router (`sw-source/index.ts`). Both sides import these types so
 * they can never disagree on shape.
 *
 * Add a new request/response pair here in Phase 0 of every SW-routed tool.
 */

export interface SwRequestBase {
  /** Discriminator used by the router. Must match a case in sw-source/index.ts. */
  type: string;
  /** Correlation id echoed back by the SW so the caller can resolve the right promise. */
  id: number;
  payload?: unknown;
}

export interface SwResponse<T = unknown> {
  id: number;
  result?: T;
  error?: string;
}

/**
 * A generic request carrying a transferable binary input and a typed payload.
 * Tool-specific payloads are defined inline (or in the tool's logic.ts).
 */
export interface SwBinaryRequest<P = unknown> extends SwRequestBase {
  payload: P;
}

/** Result wrapper for tools that return a single transferable binary output. */
export interface SwBinaryResult {
  /** Uint8Array bytes of the produced file (PDF, image, etc.). */
  data: Uint8Array;
  /** Suggested output filename. */
  filename: string;
  /** MIME type of the produced file. */
  mimeType: string;
}

/**
 * Merge PDF — combine multiple PDFs into one.
 * UI → SW: `{ type: "merge-pdf", payload: { buffers } }`
 * SW → UI: `Uint8Array` of the merged document.
 */
export const MERGE_PDF_TYPE = "merge-pdf" as const;
export interface MergePdfPayload {
  buffers: ArrayBuffer[];
}

/**
 * Split PDF — split a PDF by page ranges, selected pages, or target size.
 * UI → SW: `{ type: "split-pdf", payload: { action, buffer, ... } }`
 * SW → UI: `Uint8Array[]` of the produced documents.
 */
export const SPLIT_PDF_TYPE = "split-pdf" as const;
export type SplitPdfAction = "by-range" | "by-pages" | "by-size";
export interface SplitPdfPayload {
  action: SplitPdfAction;
  buffer: ArrayBuffer;
  rangeString?: string;
  pageNumbers?: number[];
  maxSizeBytes?: number;
}

/**
 * Rotate PDF — rotate pages by 90/180/270 degrees.
 * UI → SW: `{ type: "rotate-pdf", payload: { buffer, angle } }`
 * SW → UI: `Uint8Array` of the rotated document.
 * `angle` rotates all pages. `pageRotations` maps page index (0-based) →
 * degrees to add and overrides `angle` when present.
 */
export const ROTATE_PDF_TYPE = "rotate-pdf" as const;
export interface RotatePdfPayload {
  buffer: ArrayBuffer;
  angle?: number;
  pageRotations?: Record<number, number>;
}

/**
 * Delete Pages — remove unwanted pages from a PDF.
 * UI → SW: `{ type: "delete-pages", payload: { buffer, pageIndices } }`
 * SW → UI: `Uint8Array` of the document with pages removed.
 * `pageIndices` are 0-based page indices to delete.
 */
export const DELETE_PAGES_TYPE = "delete-pages" as const;
export interface DeletePagesPayload {
  buffer: ArrayBuffer;
  pageIndices: number[];
}

/**
 * Reorder Pages — change page order in a PDF.
 * UI → SW: `{ type: "reorder-pages", payload: { buffer, newOrder } }`
 * SW → UI: `Uint8Array` of the reordered document.
 * `newOrder` is a 0-based index array describing the desired page order.
 */
export const REORDER_PAGES_TYPE = "reorder-pages" as const;
export interface ReorderPagesPayload {
  buffer: ArrayBuffer;
  newOrder: number[];
}

/**
 * Extract Pages — extract specific pages from a PDF into a new file.
 * UI → SW: `{ type: "extract-pages", payload: { buffer, pageIndices } }`
 * SW → UI: `Uint8Array` of the document with only the selected pages.
 * `pageIndices` are 0-based page indices to keep, in the order to keep them.
 */
export const EXTRACT_PAGES_TYPE = "extract-pages" as const;
export interface ExtractPagesPayload {
  buffer: ArrayBuffer;
  pageIndices: number[];
}

/**
 * Organize Pages — reorder and/or remove pages from a PDF (optionally adding
 * pages from additional PDFs).
 * UI → SW: `{ type: "organize-pages", payload: { buffers, newOrder } }`
 * SW → UI: `Uint8Array` of the reorganized document.
 * `buffers[0]` is the primary document; later buffers are appended as extra
 * pages. `newOrder` is a list of 0-based *global* page indices describing the
 * desired final order; any page not listed is removed.
 */
export const ORGANIZE_PAGES_TYPE = "organize-pages" as const;
export interface OrganizePagesPayload {
  buffers: ArrayBuffer[];
  newOrder: number[];
}

/**
 * Add Page Numbers — draw page numbers onto every page of a PDF.
 * UI → SW: `{ type: "add-page-numbers", payload: { buffer, format, position, startNumber } }`
 * SW → UI: `Uint8Array` of the document with page numbers drawn.
 * `position` selects a corner/edge. `format` controls the text shown:
 * "page-x-of-y" → "Page 1 of 5", "number-only" → "1".
 */
export const ADD_PAGE_NUMBERS_TYPE = "add-page-numbers" as const;
export type PageNumberFormat = "page-x-of-y" | "number-only";
export type PageNumberPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right";
export interface AddPageNumbersPayload {
  buffer: ArrayBuffer;
  format: PageNumberFormat;
  position: PageNumberPosition;
  startNumber?: number;
}

/**
 * Flatten PDF — flatten layers and annotations into a single static PDF.
 * UI → SW: `{ type: "flatten-pdf", payload: { buffer } }`
 * SW → UI: `Uint8Array` of the flattened document.
 */
export const FLATTEN_PDF_TYPE = "flatten-pdf" as const;
export interface FlattenPdfPayload {
  buffer: ArrayBuffer;
}

/**
 * Sign PDF — add a signature image to a page.
 * UI → SW: `{ type: "sign-pdf", payload: { buffer, signatureImage, pageIndex?, width? } }`
 * SW → UI: `Uint8Array` of the signed document.
 * `signatureImage` is a PNG/Uint8Array. The signature is placed bottom-right
 * on page `pageIndex` (0-based, default 0), scaled to `width` points
 * (default 120) with a 32pt margin.
 */
export const SIGN_PDF_TYPE = "sign-pdf" as const;
export interface SignPdfPayload {
  buffer: ArrayBuffer;
  signatureImage: Uint8Array;
  pageIndex?: number;
  width?: number;
}

/**
 * Crop PDF — trim margins from every page.
 * UI → SW: `{ type: "crop-pdf", payload: { buffer, topPct, rightPct, bottomPct, leftPct } }`
 * SW → UI: `Uint8Array` of the cropped document.
 * Percent values (0–100) of each side's margin to remove from every page.
 */
export const CROP_PDF_TYPE = "crop-pdf" as const;
export interface CropPdfPayload {
  buffer: ArrayBuffer;
  topPct: number;
  rightPct: number;
  bottomPct: number;
  leftPct: number;
}

/**
 * Redact PDF — cover sensitive regions with solid black rectangles.
 * UI → SW: `{ type: "redact-pdf", payload: { buffer, regions } }`
 * SW → UI: `Uint8Array` of the redacted document.
 * Regions are percentage (0–100) rectangles per page. Redaction is
 * destructive: the covered content is permanently hidden.
 */
export const REDACT_PDF_TYPE = "redact-pdf" as const;
export interface RedactRegion {
  pageIndex: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}
export interface RedactPdfPayload {
  buffer: ArrayBuffer;
  regions: RedactRegion[];
}

/**
 * Watermark PDF — stamp text across every page.
 * UI → SW: `{ type: "watermark-pdf", payload: { buffer, text, fontSize?, opacity? } }`
 * SW → UI: `Uint8Array` of the watermarked document.
 * Text is drawn diagonally across the center of each page.
 */
export const WATERMARK_PDF_TYPE = "watermark-pdf" as const;
export interface WatermarkPdfPayload {
  buffer: ArrayBuffer;
  text: string;
  fontSize?: number;
  opacity?: number;
}

/**
 * Change Page Size — resize pages to a standard or custom size.
 * UI → SW: `{ type: "page-size", payload: { buffer, width?, height?, preset? } }`
 * SW → UI: `Uint8Array` of the resized document.
 * `preset` is one of "a4" | "letter" | "a5" | "legal". When a preset is given,
 * `width`/`height` are ignored. Content is scaled to fit the new page size.
 */
export const PAGE_SIZE_TYPE = "page-size" as const;
export type PageSizePreset = "a4" | "letter" | "a5" | "legal";
export interface PageSizePayload {
  buffer: ArrayBuffer;
  width?: number;
  height?: number;
  preset?: PageSizePreset;
}

/**
 * Remove Metadata — strip all document metadata from a PDF.
 * UI → SW: `{ type: "remove-metadata", payload: { buffer } }`
 * SW → UI: `Uint8Array` of the document with metadata removed.
 */
export const REMOVE_METADATA_TYPE = "remove-metadata" as const;
export interface RemoveMetadataPayload {
  buffer: ArrayBuffer;
}

/**
 * Change PDF Info — edit document metadata (title, author, subject, keywords).
 * UI → SW: `{ type: "edit-metadata", payload: { buffer, title?, author?, subject?, keywords? } }`
 * SW → UI: `Uint8Array` of the document with updated metadata.
 */
export const EDIT_METADATA_TYPE = "edit-metadata" as const;
export interface EditMetadataPayload {
  buffer: ArrayBuffer;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

/**
 * Text to PDF — convert plain text into a PDF document.
 * UI → SW: `{ type: "text-to-pdf", payload: { text } }`
 * SW → UI: `Uint8Array` of the produced PDF.
 */
export const TEXT_TO_PDF_TYPE = "text-to-pdf" as const;
export interface TextToPdfPayload {
  text: string;
}

/**
 * CSV to PDF — convert CSV data into a PDF document.
 * UI → SW: `{ type: "csv-to-pdf", payload: { csv } }`
 * SW → UI: `Uint8Array` of the produced PDF.
 * `csv` is the raw CSV file contents; rows are drawn as a simple table.
 */
export const CSV_TO_PDF_TYPE = "csv-to-pdf" as const;
export interface CsvToPdfPayload {
  csv: string;
}

/**
 * Repair PDF — rebuild a corrupted or damaged PDF.
 * UI → SW: `{ type: "repair-pdf", payload: { buffer } }`
 * SW → UI: `Uint8Array` of the repaired document.
 */
export const REPAIR_PDF_TYPE = "repair-pdf" as const;
export interface RepairPdfPayload {
  buffer: ArrayBuffer;
}

/**
 * Fill Forms — fill PDF form fields.
 * UI → SW: `{ type: "fill-forms", payload: { buffer, fields, flatten? } }`
 * SW → UI: `Uint8Array` of the filled document.
 * `fields` maps field names to string values. `flatten` burns the values in
 * so fields can no longer be edited.
 */
export const FILL_FORMS_TYPE = "fill-forms" as const;
export interface FillFormsField {
  name: string;
  value: string;
}
export interface FillFormsPayload {
  buffer: ArrayBuffer;
  fields: FillFormsField[];
  flatten?: boolean;
}
