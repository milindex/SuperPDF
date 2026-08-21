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
