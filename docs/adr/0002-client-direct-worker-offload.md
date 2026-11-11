# ADR-002: Off-main-thread processing for client-direct tools

- **Status:** Proposed
- **Date:** 2026-11-11

## Context

ADR-001 fixed two execution modes: 20 pdf-lib tools run in the Service Worker
(`sendToSw()` → `sw-source/index.ts` → `routeRequest()` in `sw-source/router.ts`
→ the tool's `logic.ts`), and 31 tools are **client-direct**, imported straight
into `ToolPage.tsx`.

The client-direct set is where the UI can freeze. Its work is not a single
`await` that yields to the event loop — it is long, mostly synchronous CPU and
canvas work interleaved with async I/O:

- `src/lib/pdfjs.ts` already parses PDFs in `/pdfjs/pdf.worker.min.mjs`, but the
  document proxy, `page.render()` into a main-thread `<canvas>`, and
  `canvas.toDataURL()` all run on the UI thread. `dataUrlToBytes()` then
  base64-decodes the result (`atob` + a byte copy), doubling peak memory.
- `pdf-to-jpg` (`logic.ts`) repeats that per page; `pdf-to-svg` and
  `export-thumbnails` do the same and add SVG string building / JSZip
  compression.
- `compress-pdf` renders every page, `embedJpg()`s each one and calls
  `PDFDocument.save()` on the main thread.
- `pdf-to-word` (`Packer.toArrayBuffer`), `pdf-to-excel` (`XLSX.write`) and
  `pdf-to-powerpoint` (`pptx.write`, slides built from base64 PNG data URLs)
  serialize whole documents in JS on the main thread.
- `ocr-pdf` renders and base64-encodes each page on the main thread; only the
  recognition step is already in tesseract's own worker.

Cost scales with page count and render resolution. While a page is painting or
a workbook is being written, input, scrolling, the preview rail and progress
updates stall — the tool looks hung, not busy.

The existing SW mode does not fit this work:

- A Service Worker has no DOM, so `<canvas>`/`document`-based code cannot run
  there, and OffscreenCanvas-in-SW support is not universal.
- The SW is one shared, event-driven global that also serves offline caching;
  a long CPU job there competes with `fetch` handling and can be terminated.
- Tesseract, docx, xlsx and pptxgenjs expect a window-like environment and are
  not written for a SW global.

## Options

1. **Leave as-is.** No code, no risk. Freezes remain and scale with file size.
2. **Move pure pdf-lib client-direct tools into the existing SW mode.** Reuses
   `sw-contract.ts`, the router and the `sendToSw()` CI check; no new runtime.
   Only a small subset qualifies (`create-pdf` and similar; confirm per tool),
   it changes registry `mode` values, and it does nothing for rendering, OCR or
   office generation — the actual freeze.
3. **Dedicated module Worker (one per run, no pool) for client-direct
   processing.** The worker hosts pdf.js (render to `OffscreenCanvas`, encode to
   Blob) and pdf-lib assembly; inputs and outputs cross as transferable
   `ArrayBuffer`s. One hand-written request/response envelope, no Comlink. Keeps
   the UI thread free for input and progress, and lets one shared runtime serve
   image export, compression, OCR and office tools. Costs: a second message
   contract to keep in sync, canvas feature detection, and a fallback path.
4. **OffscreenCanvas inside pdf.js's own worker where supported.** No new app
   worker and pdf.js keeps ownership of the pipeline. But pdf.js's worker is
   not an app RPC endpoint — the caller still orchestrates per-page work and
   encoding from the main thread — it cannot host pdf-lib saves, docx/xlsx/pptx
   generation or JSZip, and coverage depends on browser OffscreenCanvas support.
   It narrows the freeze rather than removing it.

## Decision

Adopt **Option 3**, with Option 2 as a small adjunct for tools that are already
pure pdf-lib and need no rendering.

- One module worker module, created on demand and terminated when the run ends
  (no persistent pool until profiling shows a need).
- One typed contract in `src/lib/worker-contract.ts`, mirroring
  `sw-contract.ts`: `{ id, type, payload }` requests, `{ id, result }` /
  `{ id, error }` responses, plus `{ id, progress }` and a `cancel` message.
  Every `runInWorker()` call must have a handler, enforced by a CI check that
  mirrors `check:sendtosw` (Agent.md §0.2 applied to the new transport).
- Transfer `ArrayBuffer`s in and out; inside the worker use
  `OffscreenCanvas.convertToBlob()` and Blob→`arrayBuffer()` instead of
  `toDataURL()`/`atob`.
- The worker is **an implementation detail of client-direct mode, not a third
  mode.** Registry `mode` stays `"client-direct"` for every tool in this ADR;
  `src/registry/tools.ts` is unchanged.

Phases (each phase is its own DoD-complete PR):

- **Phase A — image export:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-svg`,
  `export-thumbnails`. Establishes the contract, transferables, progress and
  cancel with the simplest tools.
- **Phase B — render + assemble:** `compress-pdf` (render and `pdf-lib` save in
  the worker), `ocr-pdf` (render in the worker, hand PNG bytes to tesseract's
  existing worker), `pdf-to-pdfa` if its pipeline is render-based.
- **Phase C — office formats:** `pdf-to-word`, `pdf-to-excel`,
  `pdf-to-powerpoint`. Verify each library is worker-safe (no `document`,
  `window`, `URL.createObjectURL` at module scope) before moving it.
- **Phase D — evaluate, don't assume:** image-to-PDF tools, `protect-pdf` /
  `unlock-pdf` (qpdf WASM) and `create-pdf` (Option 2). `webpage-to-pdf` and
  `html-to-pdf` need DOM layout and **stay on the main thread**.

Rollback: each phase is additive and independently revertible. Reverting a
phase removes that tool's `runInWorker()` call and restores its existing
`logic.ts` call site; the worker module can remain unused and be deleted.

## Consequences

- **New contract to maintain.** `worker-contract.ts` is shared by the caller
  and the worker router; shape drift is a compile error, and the CI handler
  check catches types that are called but not handled.
- **Transferables and memory.** Buffers are moved, not copied, so callers must
  not reuse an input `ArrayBuffer` after posting it. Outputs are transferred
  back per page rather than accumulated as base64 strings, which lowers peak
  memory versus today's `toDataURL()` + `atob` path.
- **Progress and cancellation.** The contract carries per-page progress so
  existing progress UI keeps working unchanged. Cancel is checked between pages
  and falls back to terminating and recreating the worker for a hard stop.
- **Fallback.** Feature-detect module workers and OffscreenCanvas 2D at run
  time. Where either is missing, run the existing main-thread path unchanged;
  the user sees the same output, only without the responsiveness gain. A worker
  construction failure is retried once on the main thread before surfacing an
  error, so the fallback is invisible.
- **pdf.js inside a worker.** The worker sets its own pdf.js worker via
  `GlobalWorkerOptions.workerPort` when nested workers are available; otherwise
  pdf.js runs its parser in-thread inside our worker, which is still off the UI
  thread. Supported-by-detection, not user-agent sniffing.
- **Tests.** `logic.ts` stays pure and unit-tested; the page loop is factored so
  a fake canvas/encoder can be injected in Vitest (no real `Worker` or
  `OffscreenCanvas` in jsdom). E2E runs in a real browser and must assert the
  downloaded bytes plus UI interactivity during a run (e.g. toggling a control
  mid-run still responds) — an actual UI→worker→download path, not a logic
  unit test. Full DoD in Agent.md §4 applies per tool.
- **Bundle and caching.** The worker is a separate, hashed asset loaded only
  when a tool needs it; it does not enter `public/sw.js`, so `npm run build:sw`
  and its CI staleness check are untouched. The SW's existing cache-first rule
  for hashed static assets covers the worker chunk.
- **UI/UX is unchanged.** Same `ToolLayout`, drop zone, preview rail and
  progress copy; no worker status is exposed — only the page stays responsive.
- **Architecture rule preserved.** This ADR changes no registry `mode`, adds no
  third mode, and is adopted **before** any code, satisfying Agent.md §0.1
  ("architecture change is its own migration PR") and §6.
