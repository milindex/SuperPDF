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
- Logos: `SuperPDFLogo` is a static server component. `SuperPDFIcon` takes an
  optional `title`; pass `title=""` when the mark sits next to the wordmark so
  screen readers do not hear the name twice.

## 6. Conventions to avoid

- No inline `style=` for layout except where dynamic values are required
  (e.g. the logo height custom property, animation delays).
- No Tailwind-style utility class strings.
- No global class overrides leaking between components.
- No hard-coded brand colours or border radii; use tokens.
