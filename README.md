# SuperPDF

SuperPDF is a **private, browser-native PDF workbench** built with Next.js
(App Router), React, TypeScript, and SCSS Modules. All processing happens
client-side — your files never leave your device. It runs at
[superpdf.milinds.dev](https://superpdf.milinds.dev).

> A from-scratch rebuild of the PDF toolkit with a single processing
> architecture, mandatory wiring/tests, and no scope creep
> (no auth, no payments, no server-side processing — it is entirely free).
> The interface borrows the Craft Apps design language — squared frames,
> hairline rules, HUD labels and scroll choreography — but keeps its own
> identity: an asymmetric document-stack hero, a crimson accent, Instrument
> Sans, ledger-style highlights and a custom document ruler.

## Stack

- **Framework:** Next.js (App Router) + Turbopack
- **Language:** TypeScript
- **Styling:** SCSS Modules (no Tailwind)
- **Processing:** Service Worker (pdf-lib) + client-direct (WASM/DOM tools)
- **Testing:** Vitest (unit) + Playwright (E2E)

## Getting Started

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

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the processing model, tool
registry, and per-tool spec format. See [Agent.md](./Agent.md) for the rules
that govern development (mandatory DoD, CI invariants, batching, etc.).
See [STYLEGUIDE.md](./STYLEGUIDE.md) for the SCSS Module conventions and the
light theme tokens.

## License

MIT
