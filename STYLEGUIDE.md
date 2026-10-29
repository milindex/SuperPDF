# SuperPDF Styleguide

This file governs how components are styled in SuperPDF. It is **not** a
marketing doc — it is the working convention for anyone (human or agent)
writing UI.

## 1. Styling approach

- **SCSS Modules only.** Every component lives in its own directory with a
  co-located `*.module.scss` file:
  ```
  src/components/{Name}/
    Name.tsx
    Name.module.scss
    __tests__/Name.test.tsx
  ```
- **No Tailwind.** Import the module and use its hashed class names:
  ```tsx
  import styles from "./Card.module.scss";
  <div className={styles.card}>…</div>
  ```
- Global, non-module styles live only in `src/app/globals.scss` (design tokens,
  resets, the app-shell sticky-footer layout, scroll choreography). A small set
  of global primitives is shared: `.hud-label`, `.tick`, `.invert-block`,
  `.visually-hidden`, `.skip-link`. Everything else is scoped.

## 2. Design tokens

Define shared values as CSS custom properties in `globals.scss`, then consume
them inside modules:

```scss
:root {
  color-scheme: light;

  --bg: #f2f1ee;             /* paper */
  --bg-raised: #faf9f7;
  --bg-sunken: #e9e8e4;
  --ink: #101014;
  --ink-strong: #000;
  --muted: #1010149e;
  --faint: #1010146b;
  --line: #10101429;
  --line-strong: #10101466;

  --app: #DC143C;            /* SuperPDF crimson */
  --app-ink: #B01030;        /* accent text on paper */
  --invert-bg: #101014;      /* primary button / hover inversion */
  --invert-fg: #f2f1ee;
  --invert-accent: #ff8098;  /* accent on inverted surfaces */
}
```

`globals.scss` also maps the legacy `--color-*` names onto these tokens so
older tool modules keep working. New code should use the semantic tokens
(`--bg`, `--ink`, `--muted`, `--line`, `--app`, `--app-ink`).

Dark mode is a first-class theme: `:root[data-theme="dark"]` and
`prefers-color-scheme: dark` both switch the token set. The header's theme
toggle writes `data-theme` and `localStorage["superpdf-theme"]`; an inline boot
script applies the stored choice before first paint. Never hard-code a light
colour in a new component.

Shape is squared: `--radius-*` tokens are `0`. Use hairline borders (1px
`--line`) and `gap: 1px` grids on a `--line` background instead of shadows.
Mono HUD labels use `.hud-label`; display headings use Instrument Sans.

### Typography

- **Display + body:** Instrument Sans (variable, `font-stretch: 100%`).
- **Editorial accents:** Instrument Serif, italic, one phrase at most (for
  example the closing “Keep the file.”).
- **HUD / labels:** Geist Mono via `.hud-label`, uppercase with wide tracking.
- Do not reintroduce Archivo or Inter. Use weights 560/620 for display and keep
  negative tracking around `-0.03em`.

### Accent and contrast

- Brand accent: `--app: #DC143C`. Text on solid crimson is white.
- Accent text on paper is `--app-ink` (`#B01030` light, `#FF8098` dark).
- On inverted surfaces use `--invert-accent`, not `--app-ink`.
- Body copy stays `--muted`; never put muted text on a crimson fill.

### Spacing

Use a consistent rhythm for stacked meta lines: at least `1.25rem` between a
status/platform line and the next block, `1.6–1.8` line-height for small
uppercase rows, and `2rem` between section heads and their content. Mobile
footer link groups use a two-column grid, not a single stacked column.

Scroll choreography is opt-in with `data-choreo`, `data-reveal`,
`data-reveal-group`, `data-draw-rule`, `data-draw-tick`, and
`data-draw-eyebrow`; `components/Choreography` wires them with an
IntersectionObserver and respects `prefers-reduced-motion`.

## 3. Component structure

- **BEM-ish naming**: `block`, `block__element`, `block--modifier` become
  `block`, `blockElement`, `blockModifier` in camelCase (SCSS module keys).
- Use nested selectors for children and `&:hover` / `&:disabled` states.
- Keep each module short and focused. If a module grows large, split the
  component instead.

## 4. Responsiveness

- Use `min-width`/`max-width` media queries inside modules. Prefer
  `auto-fit`/`auto-fill` grid for card-like layouts.
- Mobile-first: base styles target small screens; layer up with
  `@media (min-width: …)`.

## 5. Client vs server components

- Components that need interactivity (state, effects, event handlers) are
  `"use client"` at the top of the `.tsx` file.
- Everything else stays a server component. Import the client component into
  server parents where needed.
- Logos: `SuperPDFLogo` is a static server component. `SuperPDFIcon` is the
  animated shield monogram (CSS draw-in outline/S, periodic shine, hover glow).
  It takes an optional `title`; pass `title=""` when the mark sits next to the
  wordmark so screen readers do not hear the name twice. Animations are disabled
  under `prefers-reduced-motion`; do not replace the mark with a bitmap.
- `Choreography`, `ScrollRuler`, `ThemeToggle`, `ShareRow`, `FilePreview` and
  `FaqBrowser` are client components. `Section` and `DocumentStack` are static
  and can stay on the server.

## 6. Shared UI, ruler and preview

- **`Section`** supplies the numbered sticky folio, hairlines, corner ticks and
  the `data-*` hooks used by the choreography. Do not rebuild this per page.
- **`ScrollRuler`** is desktop-only. It hides the native scrollbar, reserves the
  `--ruler-rail` gutter, maps ticks to document height, and renders the live
  progress needle and section markers. Keep it out of the content column and
  respect reduced motion/keyboard access.
- **`FilePreview`** is the single source of truth for the sticky file rail.
  `ToolLayout` provides the context; `DragNDropRegion` accepts `file` and
  `fileCount` and collapses once a file exists. On mobile the rail stacks below
  the tool controls.
- **`DocumentStack`** is the hero plate. Keep it decorative (`aria-hidden`) and
  use CSS paper colours, not theme surfaces, for the sheets.
- **Footer** uses a four-column grid on desktop and a two-column grid on mobile;
  the brand band spans the full width. Do not return to a single stacked column.
- **Homepage hero** is asymmetric: copy left, document plate right, workbench
  figure below. Do not restore the centered icon/wordmark hero.

## 7. Conventions to avoid

- No inline `style=` for layout except where dynamic values are required
  (e.g. the logo height custom property, animation delays).
- No Tailwind-style utility class strings.
- No global class overrides leaking between components.
- No hard-coded brand colours or border radii; use tokens.
- No second preview panel inside a tool page; the shared rail owns it.
