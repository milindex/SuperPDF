import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

/**
 * CI check (Agent.md §0.2 / §5): every `sendToSw(<type>, ...)` call in the UI
 * must reference a `type` that the SW router handles. Prevents orphaned UI
 * calls from shipping.
 *
 * Heuristic: finds `sendToSw(` calls and extracts the first string-literal
 * argument; compares against `handledTypes` exported by sw-source/router.ts.
 * Non-literal (variable) types are flagged for manual review.
 */

const require = createRequire(import.meta.url);

const SRC = "src";
const ROUTER_ENTRY = "sw-source/router.ts";
// File that *defines* sendToSw — its signature isn't a call site.
const DEFINITION_FILE = "src/lib/sw-client.ts";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === "__tests__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const routerSrc = readFileSync(ROUTER_ENTRY, "utf8");
  const match = routerSrc.match(
    /export const handledTypes\s*:\s*string\[\]\s*=\s*\[([^\]]*)\]/s,
  );
  const handled = new Set(
    match ? [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [],
  );

  const files = walk(SRC);
  const orphans = [];
  const dynamic = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    // Strip comments so docs/annotations mentioning sendToSw don't false-positive.
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const re = /sendToSw\(\s*(['"`])([^'"`]+)\1/g;
    let m;
    while ((m = re.exec(src))) {
      const type = m[2];
      if (!handled.has(type)) {
        orphans.push({ file, type });
      }
    }
    if (file !== DEFINITION_FILE && /sendToSw\(\s*(?!['"`])/.test(src)) {
      dynamic.push(file);
    }
  }

  if (orphans.length) {
    console.error("✗ Orphaned sendToSw() calls (type not handled in SW router):");
    for (const o of orphans) {
      console.error(`   - ${o.file}: type "${o.type}"`);
    }
    console.error(
      "   Add a router case in sw-source/router.ts and re-run `npm run build:sw`.",
    );
    process.exit(1);
  }
  if (dynamic.length) {
    console.warn("⚠ sendToSw() called with a non-literal type in:");
    for (const f of dynamic) console.warn(`   - ${f}`);
    console.warn("   These cannot be auto-checked — confirm they resolve to handled types.");
  }
  console.log("✓ No orphaned sendToSw() calls");
}

main();
