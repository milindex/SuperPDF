import * as esbuild from "esbuild";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Builds the Service Worker from `sw-source/` to `public/sw.js`.
 *
 * Flags:
 *   --out=<path>   write the bundle to a custom path (used by the CI check)
 *   --no-hash      skip writing the hash manifest (CI check mode)
 */
const outIndex = process.argv.findIndex((a) => a === "--out" || a.startsWith("--out="));
let outPath = "public/sw.js";
if (outIndex !== -1) {
  const raw = process.argv[outIndex];
  outPath = raw.startsWith("--out=") ? raw.slice("--out=".length) : process.argv[outIndex + 1];
}
const noHash = process.argv.includes("--no-hash");

// Static banner so rebuilds are byte-identical (deterministic hash for CI staleness check).
const banner = `/* SuperPDF Service Worker — generated from sw-source/. Do not hand-edit. */`;

await esbuild.build({
  entryPoints: ["sw-source/index.ts"],
  outfile: outPath,
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  sourcemap: false,
  banner: { js: banner },
});

if (outPath === "public/sw.js" && !noHash) {
  const swPath = resolve("public/sw.js");
  if (!existsSync(swPath)) {
    throw new Error("public/sw.js was not produced by the build");
  }
  const hash = createHash("sha256").update(readFileSync(swPath)).digest("hex");
  writeFileSync("public/sw.hash.json", JSON.stringify({ sha256: hash }));
  console.log("✓ Service Worker built: public/sw.js");
}
