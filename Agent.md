# Agent Instructions for SuperPDF

This file governs how any AI coding agent (Claude Code or otherwise) works in this
repo. Read it before writing any code. When in doubt, follow this file over your
own judgment — it encodes hard lessons from a prior build of this exact project.

**Current release:** `3.0.0.20261029` · **Public Beta** · `https://superpdf.milinds.dev`

---

## 0. Non-negotiable rules

1. **One architecture, always current.** This repo has exactly one processing
   architecture at any time (see `ARCHITECTURE.md`). Never write code against a
   "future" or "planned" architecture described in comments or docs. If the
   architecture needs to change, that's a migration PR on its own, not something
   mixed into a feature PR.

2. **No orphaned UI calls.** If you add or modify any call from the UI into the
   Service Worker (`sendToSw()` / `postMessage`), you MUST, in the same change:
   - Confirm the message `type` (and any `action` sub-field) is handled in
     `sw-source/index.ts`
   - Add the router case if it doesn't exist
   - Add a test that exercises the full UI → SW → response path, not just the
     pure logic function

   Before ending any task that touches `sendToSw()`, grep the router file to
   confirm every type/action you call is handled. Do not mark a tool
   "implemented" until this check passes.

3. **Build artifacts are never stale.** `public/sw.js` is a build output of
   `sw-source/`. Never hand-edit it. After any change under `sw-source/`, run
   `npm run build:sw` in the same commit. This must also be enforced by CI (see
   §5) — do not rely on memory.

4. **Docs are generated, not hand-maintained.** The generated blocks in
   `ARCHITECTURE.md` (implemented status, tool table and known gaps) are produced
   from `src/registry/tools.ts` via `npm run docs:gen`. Never hand-edit generated
   sections (marked with `<!-- GENERATED:START -->` / `<!-- GENERATED:END -->`).
   If a doc and the registry disagree, the registry is correct — fix the doc.

5. **A tool is not "implemented" until it passes the Definition of Done** (§4).
   Marking `hasModule: true` or `status: "implemented"` in the registry without
   meeting the DoD is the single most common failure mode in this project's
   history — do not repeat it.

---

## 1. Architecture (source of truth)

- **Framework:** Next.js (App Router), React, TypeScript, SCSS Modules
- **Processing split:**
  - pdf-lib–based tools (merge, split, rotate, watermark, page operations,
    metadata, redaction, signing, text/CSV input) run **inside the Service
    Worker** via `sw-source/processors/*.ts`.
  - WASM/DOM-dependent tools (pdf.js rendering, tesseract OCR, docx/xlsx/pptx
    generation, html2pdf, image conversion, encryption via qpdf) run
    **client-direct**, imported straight into `ToolPage.tsx`.
  - The registry's `mode` field is authoritative. This split is decided once,
    per tool, at spec time (§2) — not improvised during implementation.
- **Message contract:** every SW-routed tool has its message `type` and payload
  shape defined in `src/lib/sw-contract.ts` (generated types, shared by both the
  UI sender and the SW router — see §2, Phase 0)

Do not add a third execution mode (e.g. a new worker pool, a new RPC layer)
without an ADR (see `docs/adr/`).

---

## 2. Adding a new tool — required sequence

Follow this order. Do not skip ahead.

**Phase 0 — Contract**
Add the tool's message type to `src/lib/sw-contract.ts` (if SW-routed). This is
the single shared type both the UI and the router import — it should be
impossible for them to disagree on shape.

**Phase 1 — Logic**
Write `logic.ts`: pure function, no DOM/React/SW dependencies, fully unit
tested. Input/output types come from the contract in Phase 0.

**Phase 2 — Wiring**
- If SW-routed: add the router case in `sw-source/index.ts`, run
  `npm run build:sw`
- If client-direct: import `logic.ts` straight into `ToolPage.tsx`
- Either way: grep-confirm no orphaned call exists (§0.2)

**Phase 3 — UI**
Build `ToolPage.tsx` using the shared components (`ToolLayout`, `ToolHeader`,
`DragNDropRegion`, `SuccessBanner`). Pass the current file state to the drop
zone (`file={file}` or `file={files[0] ?? null}` plus `fileCount`) so the
drop zone collapses and the sticky `FilePreview` rail renders. Do not add a
second preview panel. Do not invent new layout patterns without checking
`STYLEGUIDE.md`.

**Phase 4 — Tests**
- Unit test for `logic.ts` (required)
- E2E test exercising the real UI → (SW or client) → download path (required
  for SW-routed tools; strongly recommended for client-direct)

**Phase 5 — Registry**
Only now, set `status: "implemented"` in `src/registry/tools.ts`. Regenerate
docs (`npm run docs:gen`).

---

## 3. Batching rule

Implement tools in batches of ~5, grouped by category. Do not scaffold all
tools in a category before any of them are fully done (Phases 0–5) — this is
how partially-wired tools get merged and forgotten. Finish a tool before
starting the next.

---

## 4. Definition of Done (per tool)

A tool may be marked `"implemented"` only if **all** of the following are true:

- [ ] `logic.ts` exists, is pure, and has a passing unit test
- [ ] If SW-routed: router case exists in `sw-source/index.ts` and
      `public/sw.js` has been rebuilt since
- [ ] No `sendToSw()` call in the tool's UI references an unhandled type/action
- [ ] E2E test exists and passes for the full user-facing flow
- [ ] Tool appears correctly via the registry-generated docs (no manual doc edits)
- [ ] Any known limitation (e.g. destructive/lossy behavior) is surfaced in the
      UI, not just in docs

If any box is unchecked, the status is `"planned"` or `"in-progress"` — never
`"implemented"`.

---

## 5. CI requirements (set these up in Phase 0 of the whole project, not later)

- `npm run build:sw` check: fail the build if any file under `sw-source/` has a
  newer mtime / different hash than what's reflected in `public/sw.js`
- `npm run docs:gen -- --check`: fail if generated doc sections differ from
  what regeneration would produce (catches manual doc edits)
- Unit + e2e test run on every PR
- A lint rule or custom script that greps for `sendToSw(` calls and cross-checks
  against router-handled types (automates §0.2)

---

## 6. What NOT to do

- Don't hand-edit `public/sw.js`
- Don't hand-edit generated doc sections
- Don't mark a tool implemented based on UI existing + logic existing — the
  wiring between them is part of the tool, not an afterthought
- Don't write "Future Architecture" sections into `ARCHITECTURE.md` — open an
  ADR instead
- Don't scaffold more than one tool's UI before its predecessor is fully done
  (DoD-complete)
- Don't hard-code colours/radii or remove the theme boot script, ruler, scroll
  choreography or file-preview provider
- Don't add a second file preview inside a tool page; the shared rail owns it

---

## 7. File/dir conventions
```
src/tools/{tool-id}/
  logic.ts              # pure processing function, unit tested
  ToolPage.tsx           # UI, uses shared components
  __tests__/logic.test.ts

src/components/          # shell + Section, ScrollRuler, FilePreview, FAQ UI
src/app/faq/             # FAQ route and FaqBrowser search
src/lib/faq-search.ts    # wildcard/fuzzy FAQ scoring and suggestions

sw-source/
  index.ts               # router — every SW-routed tool has a case here
  processors/*.ts         # grouped processing implementations

src/lib/sw-contract.ts   # shared message types (UI + SW import this)
src/registry/tools.ts    # single source of truth for tool status/metadata
docs/adr/                # architecture decisions (append-only)
```

---

## 8. UI and design system

- **Tokens first.** Use the semantic tokens in `src/app/globals.scss`
  (`--bg`, `--ink`, `--muted`, `--line`, `--app`, `--app-ink`, `--invert-*`).
  The brand accent is crimson `#DC143C`; on-colour text is white. Never hard-code
  a brand colour or border radius.
- **Type.** Instrument Sans for display and body, Instrument Serif for editorial
  accents, Geist Mono for `.hud-label`. Do not reintroduce Archivo/Inter.
- **Shell.** The root layout owns `Choreography`, `ScrollRuler`, the theme boot
  script and `ScrollRuler`'s reserved gutter. Do not remove or bypass them when
  adding a page.
- **Tool pages.** `ToolLayout` supplies `ToolModeScope` and
  `FilePreviewProvider`; the preview rail is part of the shell. Keep the drop
  zone's `file`/`fileCount` props in sync with the tool's state.
- **FAQ.** Search behaviour lives in `src/lib/faq-search.ts` and is covered by
  unit tests. Keep wildcard and fuzzy behaviour intact.
- **Status.** The site is in **Public Beta**; the hero links “Report issues here”
  to the GitHub issue tracker. Keep that link.
- **Accessibility.** Respect `prefers-reduced-motion`, keep the ruler
  keyboard-scrollable, and preserve visible focus states in new controls.
