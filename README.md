# SuperPDF

SuperPDF is a **private, browser-native PDF workbench** built with Next.js
(App Router), React, TypeScript, and SCSS Modules. Processing happens entirely on
your device — files are never uploaded, stored, or sent to a server.

**Live:** [superpdf.milinds.dev](https://superpdf.milinds.dev)  
**Status:** Public Beta · **Release:** `3.0.1.20261029`  
**Source:** [github.com/milindex/SuperPDF](https://github.com/milindex/SuperPDF)

## What it does

- **51 PDF tools** for organising, converting, editing, securing, optimising and
  extracting content from PDFs.
- **No upload, no account.** Every tool runs in the tab with pdf-lib, pdf.js,
  qpdf WebAssembly and other local engines.
- **Workflows.** Chain tools such as compress → page numbers → watermark and run
  them on one file.
- **Offline-ready.** An installable PWA keeps the tools available after the first
  load.
- **Light and dark themes** that follow your system preference and remember your
  choice.
- **File preview rail.** After a file is chosen, tool pages collapse the drop
  zone and show a sticky first-page preview with size and page count.
- **Fuzzy FAQ search.** Wildcards (`*`, `?`), typo tolerance, and nearest-question
  suggestions.

## What's new in v3

- A distinct **crimson SuperPDF identity** (`#DC143C`) with a new **animated
  shield monogram**, favicon, manifest and social card. The shield draws its
  outline and S on load, then catches a soft periodic shine.
- **Instrument Sans** for display and body copy, **Instrument Serif** for
  editorial accents, and **Geist Mono** for HUD labels.
- An asymmetric homepage hero with a **document-stack plate**, ledger-style
  highlights, a dark cover-sheet closing band, and a compact mobile footer.
- A custom **document ruler** scrollbar with a blurred rail, live progress
  readout, tick labels and section markers.
- A **sticky file preview rail** and FAQ wildcard/fuzzy search.
- Public Beta status with a direct **GitHub issue** link.

## Stack

- **Framework:** Next.js (App Router) + Turbopack
- **Language:** TypeScript
- **Styling:** SCSS Modules (no Tailwind)
- **Processing:** Service Worker (pdf-lib) + client-direct (WASM/DOM tools)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Type:** Instrument Sans, Instrument Serif, Geist Mono via `next/font`

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the dev server on port 3000                    |
| `npm run build`      | Production build                                     |
| `npm test`           | Run Vitest unit tests                                |
| `npm run test:e2e`   | Run Playwright E2E tests                             |
| `npm run test:ci`    | Run unit + E2E tests                                 |
| `npm run build:sw`   | Build `sw-source/` → `public/sw.js`                  |
| `npm run docs:gen`   | Regenerate generated doc sections in ARCHITECTURE.md |
| `npm run check`      | CI checks: SW freshness, docs, orphaned `sendToSw()` |

## Project structure

```
src/app/                  App Router pages, layout, global tokens
src/components/           shared shell and UI primitives
src/lib/                  processing clients, search, storage, SEO
src/registry/             tool registry and known gaps
src/tools/{tool-id}/      tool logic + ToolPage + tests
sw-source/                service-worker router and processors
public/                   icons, manifest, worker assets, service worker
```

Key shared UI pieces: `Section`, `Choreography`, `ScrollRuler`, `FilePreview`,
`DocumentStack`, `ShareRow`, `ThemeToggle`, `ToolsFilter` and `FaqBrowser`.

## Architecture and conventions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the processing and presentation
model. See [Agent.md](./Agent.md) for development rules (mandatory DoD, CI
invariants, batching, etc.). See [STYLEGUIDE.md](./STYLEGUIDE.md) for SCSS
Module conventions, typography and the light/dark design tokens.

## Deployment

Production builds use `output: "export"` and are served from `out/` on
Cloudflare Pages. The canonical domain is `https://superpdf.milinds.dev`.

## Reporting issues

Public Beta feedback is welcome at
[github.com/milindex/SuperPDF/issues](https://github.com/milindex/SuperPDF/issues).

## License

MIT
