"use client";

/**
 * Client-side loader for the qpdf WASM engine (public/qpdf/qpdf.js).
 *
 * qpdf is an Emscripten build that spawns pthread workers and relies on
 * SharedArrayBuffer, so it must run on the main thread and the page must be
 * cross-origin isolated (COOP/COEP headers). It performs real PDF
 * encryption/decryption in the browser.
 *
 * The engine is an ES module, so we load it by injecting a module script that
 * imports the public URL and stashes its `init` on `window`. This avoids the
 * bundler trying to resolve/resolve the dynamic import at build time.
 */

const SCRIPT_URL = "/qpdf/qpdf.js";

type QpdfFs = {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
  unlink: (path: string) => void;
};

export type QpdfModule = {
  FS: QpdfFs;
  callMain: (args: string[]) => void;
};

let modulePromise: Promise<QpdfModule> | null = null;

function loadEngine(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-superpdf-qpdf="engine"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load the PDF security engine.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.dataset.superpdfQpdf = "engine";
    script.textContent = `
      import("${SCRIPT_URL}").then((m) => {
        window.__superpdfQpdfInit = m.default;
        window.dispatchEvent(new CustomEvent("superpdf-qpdf-ready"));
      }).catch(() => {
        window.dispatchEvent(new CustomEvent("superpdf-qpdf-error"));
      });
    `;
    script.addEventListener("error", () =>
      reject(new Error("Failed to load the PDF security engine.")),
    );
    document.head.appendChild(script);

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Failed to load the PDF security engine."));
    };
    const cleanup = () => {
      window.removeEventListener("superpdf-qpdf-ready", onReady);
      window.removeEventListener("superpdf-qpdf-error", onError);
    };
    window.addEventListener("superpdf-qpdf-ready", onReady);
    window.addEventListener("superpdf-qpdf-error", onError);
  });
}

async function getModule(): Promise<QpdfModule> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    await loadEngine();
    const w = window as unknown as { __superpdfQpdfInit?: () => Promise<QpdfModule> };
    if (typeof w.__superpdfQpdfInit !== "function") {
      throw new Error("The PDF security engine did not initialize.");
    }
    return w.__superpdfQpdfInit();
  })();
  return modulePromise;
}

/**
 * Run a qpdf CLI operation. Writes `input` to a temp file, invokes the given
 * qpdf args (excluding the in/out paths), and returns the output bytes.
 */
export async function runQpdf(
  args: string[],
  input: Uint8Array,
): Promise<Uint8Array> {
  const qpdf = await getModule();
  const FS = qpdf.FS;
  const inPath = "/superpdf-in.pdf";
  const outPath = "/superpdf-out.pdf";
  try {
    FS.unlink(inPath);
  } catch {
    /* not present */
  }
  try {
    FS.unlink(outPath);
  } catch {
    /* not present */
  }

  FS.writeFile(inPath, input);
  qpdf.callMain([...args, "--", inPath, outPath]);
  const out = FS.readFile(outPath);
  FS.unlink(inPath);
  FS.unlink(outPath);
  return out;
}