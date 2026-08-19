# ADR-001: Two-mode processing split

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

SuperPDF processes files entirely in the browser (no server-side processing).
Tools fall into two families based on their dependencies:

- pdf-lib–based tools (pure JS): merge, split, watermark, rotate, delete,
  extract, reorder, organize, protect, unlock, etc.
- WASM/DOM-dependent tools: pdfjs-dist rendering, tesseract OCR, docx/xlsx/pptx
  generation, html2pdf.

A prior build (v1) drifted between Comlink Web Workers and a Service Worker,
leaving two inconsistent patterns.

## Decision

Exactly two execution modes exist, and each tool is assigned one at spec time
(registry `mode` field). A tool does not change modes without a new ADR.

1. **Service-Worker-routed** — pdf-lib tools. UI calls `sendToSw()` with a typed
   message (`src/lib/sw-contract.ts`); the SW router (`sw-source/index.ts`) maps
   the `type` to a processor and returns a transferable result.
2. **Client-direct** — WASM/DOM tools. Logic is imported straight into
   `ToolPage.tsx`; no SW round-trip.

## Consequences

- One architecture at any time; no third mode without an ADR.
- Every SW-routed tool must add a router case, a shared contract type, and a
  full UI→SW→response test (Agent.md §0.2, §2, §4).
- CI enforces no orphaned `sendToSw()` calls and no stale `public/sw.js`.
