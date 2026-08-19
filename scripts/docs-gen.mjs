import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const check = process.argv.includes("--check");

const require = createRequire(import.meta.url);

/**
 * Load the registry (and known-gaps) by bundling the TS to a temp file and
 * importing it. This keeps docs generation in sync with the real source of
 * truth rather than a hand-typed copy.
 */
async function loadRegistry() {
  const dir = mkdtempSync(join(tmpdir(), "superpdf-docs-"));
  try {
    await build({
      entryPoints: ["src/registry/tools.ts", "src/registry/known-gaps.ts"],
      outdir: dir,
      bundle: true,
      format: "esm",
      platform: "node",
      outExtension: { ".js": ".mjs" },
    });
    const tools = await import(pathToFileURL(join(dir, "tools.mjs")).href);
    const gaps = await import(pathToFileURL(join(dir, "known-gaps.mjs")).href);
    return { tools: tools.toolsRegistry, gaps: gaps.knownGaps };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function toolTableMarkdown(tools) {
  const rows = tools
    .map(
      (t) =>
        `| ${t.id} | ${t.category} | ${t.status} | ${t.mode} |`,
    )
    .join("\n");
  return `| id | category | status | mode |
|---|---|---|---|
${rows || "_(no tools registered yet)_"}`;
}

function gapsMarkdown(tools, gaps) {
  const gapTools = tools
    .filter((t) => t.status !== "implemented")
    .map((t) => `- **${t.name}** (\`${t.id}\`) — ${t.status}`);
  const manual = gaps.map((g) => `- **${g.id}** — ${g.description}`);
  const all = [...gapTools, ...manual];
  return all.length ? all.join("\n") : "_(no known gaps)_";
}

function replaceBlock(content, marker, replacement) {
  const start = `<!-- GENERATED:START:${marker} -->`;
  const end = `<!-- GENERATED:END:${marker} -->`;
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) {
    throw new Error(`Generated block ${marker} not found in target file`);
  }
  const before = content.slice(0, s + start.length);
  const after = content.slice(e);
  return `${before}\n${replacement}\n${after}`;
}

const { tools, gaps } = await loadRegistry();

const archPath = resolve("ARCHITECTURE.md");
const arch = readFileSync(archPath, "utf8");

let updated = replaceBlock(arch, "tool-table", toolTableMarkdown(tools));
updated = replaceBlock(updated, "gaps", gapsMarkdown(tools, gaps));
updated = replaceBlock(updated, "status", tools.filter((t) => t.status === "implemented").length);

if (check) {
  if (updated !== arch) {
    console.error("✗ ARCHITECTURE.md is stale. Run `npm run docs:gen`.");
    process.exit(1);
  }
  console.log("✓ docs are up to date");
} else {
  writeFileSync(archPath, updated);
  console.log("✓ regenerated ARCHITECTURE.md");
}
