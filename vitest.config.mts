import { defineConfig } from "vitest/config";
import path from "node:path";

const alias = {
  "@": path.resolve(import.meta.dirname, "src"),
};

// Explicit DOM list: only these suites touch React/DOM APIs (component
// rendering, window/localStorage, canvas/image decoding). Everything else runs
// in the fast `node` environment — the jsdom boot is the dominant cost in CI,
// so keep this list small and move a file here only when it actually needs a
// DOM rather than polyfilling one.
const domTests = [
  "src/components/**/__tests__/*.test.tsx",
  "src/lib/__tests__/settings.test.ts",
  "src/lib/__tests__/use-object-url.test.ts",
  "src/lib/__tests__/workflow.test.ts",
  "src/tools/export-thumbnails/__tests__/logic.test.ts",
  "src/tools/{bmp-to-pdf,excel-to-pdf,extract-images,html-to-pdf,pdf-to-word,scan-to-pdf,svg-to-pdf,tiff-to-pdf,webp-to-pdf,webpage-to-pdf,word-to-pdf}/__tests__/logic.test.ts",
];

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: domTests,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "node",
          environment: "node",
          globals: true,
          setupFiles: [],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          exclude: domTests,
        },
      },
    ],
  },
});
