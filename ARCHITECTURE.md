# SuperPDF Architecture

> Sections marked GENERATED are produced by `npm run docs:gen` from
> `src/registry/tools.ts` and `src/lib/sw-contract.ts`. Do not hand-edit them —
> edit the source and regenerate. Everything else in this file is
> hand-maintained and should stay short.

## 1. Summary

| Attribute | Value |
|---|---|
| Framework | Next.js (App Router), React, TypeScript, SCSS modules |
| Processing | Service Worker (pdf-lib) + client-direct (WASM/DOM tools) |
| Status | <!-- GENERATED:START:status -->
51
<!-- GENERATED:END:status --> |

## 2. Processing model

Two execution modes only. A tool is assigned one at spec time and does not
change modes without an ADR.

- **Service-Worker-routed**: pdf-lib–based tools. UI calls `sendToSw()` with a
  typed message (see `src/lib/sw-contract.ts`) → SW router
  (`sw-source/index.ts`) → processor (`sw-source/processors/*.ts`) → result.
- **Client-direct**: WASM/DOM-dependent tools (pdfjs render, OCR, docx/xlsx/pptx
  generation, html2pdf). Logic imported straight into `ToolPage.tsx`, no SW
  round-trip.

No third mode without an ADR in `docs/adr/`.

## 3. Tool registry

<!-- GENERATED:START:tool-table -->
| id | category | status | mode |
|---|---|---|---|
| merge-pdf | Organize | implemented | sw-routed |
| split-pdf | Organize | implemented | sw-routed |
| rotate-pdf | Organize | implemented | sw-routed |
| delete-pages | Organize | implemented | sw-routed |
| reorder-pages | Organize | implemented | sw-routed |
| extract-pages | Organize | implemented | sw-routed |
| organize-pages | Organize | implemented | sw-routed |
| add-page-numbers | Organize | implemented | sw-routed |
| flatten-pdf | Organize | implemented | sw-routed |
| sign-pdf | Edit | implemented | sw-routed |
| crop-pdf | Edit | implemented | sw-routed |
| redact-pdf | Edit | implemented | sw-routed |
| watermark-pdf | Edit | implemented | sw-routed |
| page-size | Edit | implemented | sw-routed |
| protect-pdf | Security | implemented | client-direct |
| unlock-pdf | Security | implemented | client-direct |
| remove-metadata | Security | implemented | sw-routed |
| edit-metadata | Security | implemented | sw-routed |
| text-to-pdf | Convert To PDF | implemented | sw-routed |
| csv-to-pdf | Convert To PDF | implemented | sw-routed |
| repair-pdf | Optimization | implemented | sw-routed |
| fill-forms | Create & Forms | implemented | sw-routed |
| pdf-to-text | Convert From PDF | implemented | client-direct |
| pdf-to-markdown | Convert From PDF | implemented | client-direct |
| pdf-to-jpg | Convert From PDF | implemented | client-direct |
| pdf-to-png | Convert From PDF | implemented | client-direct |
| extract-images | Convert From PDF | implemented | client-direct |
| pdf-to-word | Convert From PDF | implemented | client-direct |
| pdf-to-powerpoint | Convert From PDF | implemented | client-direct |
| pdf-to-excel | Convert From PDF | implemented | client-direct |
| pdf-to-svg | Convert From PDF | implemented | client-direct |
| pdf-to-html | Convert From PDF | implemented | client-direct |
| jpg-to-pdf | Convert To PDF | implemented | client-direct |
| png-to-pdf | Convert To PDF | implemented | client-direct |
| webp-to-pdf | Convert To PDF | implemented | client-direct |
| svg-to-pdf | Convert To PDF | implemented | client-direct |
| heic-to-pdf | Convert To PDF | implemented | client-direct |
| tiff-to-pdf | Convert To PDF | implemented | client-direct |
| excel-to-pdf | Convert To PDF | implemented | client-direct |
| word-to-pdf | Convert To PDF | implemented | client-direct |
| webpage-to-pdf | Convert To PDF | implemented | client-direct |
| compress-pdf | Optimization | implemented | client-direct |
| ocr-pdf | Optimization | implemented | client-direct |
| pdf-to-pdfa | Optimization | implemented | client-direct |
| scan-to-pdf | Create & Forms | implemented | client-direct |
| bmp-to-pdf | Convert To PDF | implemented | client-direct |
| html-to-pdf | Convert To PDF | implemented | client-direct |
| inspect-metadata | Security | implemented | client-direct |
| export-thumbnails | Extraction | implemented | client-direct |
| remove-restrictions | Security | implemented | client-direct |
| create-pdf | Create & Forms | implemented | client-direct |
<!-- GENERATED:END:tool-table -->

## 4. Per-tool spec format

Each tool gets a short spec (not a full product doc — see §7 for where
personas/SEO/monetization content lives instead). Template:

```markdown
### {Tool Name}
- **Mode:** SW-routed | client-direct
- **Input:** ...
- **Output:** ...
- **Algorithm:** 1–3 sentences, or link to logic.ts if self-explanatory
- **Known limitations:** anything lossy/destructive/partial — must also be
  surfaced in the UI, not just here
- **Edge cases handled:** bullet list
```

Keep each spec under ~15 lines. If you're writing more, it belongs in code
comments or a separate product doc, not here.

## 5. Directory structure

```
src/tools/{tool-id}/       logic.ts, ToolPage.tsx, __tests__/
sw-source/                 index.ts (router), processors/*.ts
src/lib/sw-contract.ts     shared message types
src/registry/tools.ts      single source of truth for status/metadata
docs/adr/                  architecture decisions, append-only
```

## 6. Build & CI invariants

- `public/sw.js` is generated from `sw-source/` via `npm run build:sw`. CI
  fails if it's stale relative to source.
- Docs regenerate via `npm run docs:gen`. CI fails (`--check` mode) if
  generated sections don't match current source.
- Every SW-routed tool's `sendToSw()` calls are checked against router-handled
  types in CI (see `CLAUDE.md` §5).

## 7. What's deliberately NOT in this doc

Personas, search intent, SEO strategy, and monetization details live in a
separate `docs/product/` doc, not here. This file is for anyone (human or
agent) implementing or debugging processing logic — keep it about how the
system works, not why it's marketed the way it is.

## 8. Current gaps

<!-- GENERATED:START:gaps -->
_(no known gaps)_
<!-- GENERATED:END:gaps -->

## 9. ADR index

See `docs/adr/`. Any change to the processing model, routing strategy, or
execution-mode assignment requires a new ADR here before implementation.
