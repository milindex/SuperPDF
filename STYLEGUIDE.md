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
- **No Tailwind, no global utility classes.** Import the module and use its
  hashed class names:
  ```tsx
  import styles from "./Card.module.scss";
  <div className={styles.card}>…</div>
  ```
- Global, non-module styles live only in `src/app/globals.scss` (design tokens,
  resets, the app-shell sticky-footer layout). Everything else is scoped.

## 2. Design tokens

Define shared values as CSS custom properties in `globals.scss`, then consume
them inside modules:

```scss
:root {
  color-scheme: light;

  --color-brand: #29d192;          /* accent */
  --color-brand-hover: #20b67f;
  --color-brand-light: #4be0a7;

  --color-bg: #ffffff;
  --color-surface: #f7f7f7;
  --color-surface-2: #efefef;
  --color-surface-3: #e7e7e7;

  --color-border: #e2e2e2;
  --color-border-light: #d9d9d9;
  --color-border-active: #29d192;

  --color-text-primary: #111111;
  --color-text-secondary: #4a4a4a;
  --color-text-muted: #6b6b6b;
}
```

Use `var(--color-*)` in modules. Do not hard-code colors. Text on solid
brand-green buttons should be black (`#000000`); text on green-tinted surfaces
should use `--color-text-primary`/`--color-brand`, never white.

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
- Logos: `AnimatedLogo` is a client component (hover animation). Static
  `SuperPDFLogo` / `SuperPDFIcon` can be used in server components.

## 6. Conventions to avoid

- No inline `style=` for layout except where dynamic values are required
  (e.g. animation state in `AnimatedLogo`).
- No Tailwind-style utility class strings.
- No global class overrides leaking between components.
