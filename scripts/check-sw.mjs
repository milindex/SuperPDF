import { readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

/**
 * CI check: `public/sw.js` must not be stale relative to `sw-source/`.
 * Rebuilds to a temp file and compares its sha256 against the committed
 * manifest (written by `npm run build:sw`).
 */
const manifestPath = "public/sw.hash.json";
const tempOut = "public/.sw-check.js";

let recorded = null;
try {
  recorded = JSON.parse(readFileSync(manifestPath, "utf8")).sha256;
} catch {
  console.error("✗ public/sw.hash.json missing. Run `npm run build:sw` first.");
  process.exit(1);
}

execFileSync(process.execPath, ["scripts/build-sw.mjs", `--out=${tempOut}`, "--no-hash"], {
  stdio: "inherit",
});

const fresh = createHash("sha256").update(readFileSync(tempOut)).digest("hex");
rmSync(tempOut, { force: true });

if (recorded !== fresh) {
  console.error("✗ public/sw.js is stale. Run `npm run build:sw` and commit the result.");
  process.exit(1);
}
console.log("✓ public/sw.js is up to date");
