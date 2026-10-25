"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import { sendToSw } from "@/lib/sw-client";
import { SPLIT_PDF_TYPE, type SplitPdfAction } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

type Mode = SplitPdfAction;

interface OutputFile {
  url: string;
  name: string;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "by-range", label: "By Range" },
  { value: "by-pages", label: "By Pages" },
  { value: "by-size", label: "By Size" },
  { value: "by-n", label: "Every N Pages" },
  { value: "by-even-odd", label: "By Even/Odd" },
  { value: "by-bookmarks", label: "By Bookmarks" },
];

const ADVANCED_MODES: Mode[] = [
  "by-size",
  "by-n",
  "by-even-odd",
  "by-bookmarks",
];

const MODE_HELP: Record<Mode, string> = {
  "by-range":
    "Each comma-separated group becomes its own file. Use a hyphen for a span of pages.",
  "by-pages": "Each page you list is saved as a separate one-page file.",
  "by-size":
    "Splits at page boundaries to keep each file near the size you set. A single page is never cut.",
  "by-n": "Starts a new file every N pages. The last file may be shorter.",
  "by-even-odd":
    "Produces two files: odd-numbered pages and even-numbered pages.",
  "by-bookmarks":
    "Produces one file per top-level bookmark. A PDF with no bookmarks is left whole.",
};

export default function SplitPdfTool() {
  const modeControl = useToolMode();
  const easy = modeControl?.mode !== "advanced";
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("by-range");
  const [rangeString, setRangeString] = useState("");
  const [pageNumbers, setPageNumbers] = useState("");
  const [everyN, setEveryN] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("MB");
  const [processing, setProcessing] = useState(false);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setOutputs([]);
    setError(null);
  }, []);

  const activeMode: Mode =
    easy && ADVANCED_MODES.includes(mode) ? "by-range" : mode;

  const canSplit = file !== null && !processing;

  const split = async () => {
    if (!canSplit || !file) return;
    setProcessing(true);
    setOutputs([]);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      let action: Mode = activeMode;
      let payload: Record<string, unknown> = {};

      if (activeMode === "by-range") {
        if (!rangeString.trim()) throw new Error("Enter page ranges.");
        payload = { rangeString };
      } else if (activeMode === "by-pages") {
        const pages = pageNumbers
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n));
        if (pages.length === 0) throw new Error("Enter page numbers.");
        payload = { pageNumbers: pages };
      } else if (activeMode === "by-n") {
        const n = parseInt(everyN, 10);
        if (!n || n < 1) throw new Error("Enter the number of pages per split.");
        payload = { everyNPages: n };
      } else if (activeMode === "by-size") {
        const size = parseFloat(maxSize);
        if (!size || size <= 0) throw new Error("Enter a target size.");
        const bytes =
          sizeUnit === "KB" ? size * 1024 : size * 1024 * 1024;
        payload = { maxSizeBytes: Math.floor(bytes) };
      }

      const results = (await sendToSw(SPLIT_PDF_TYPE, {
        action,
        buffer,
        ...payload,
      })) as Uint8Array[];

      const base = file.name.replace(/\.pdf$/i, "");
      const items = results.map((r, i) => {
        const url = URL.createObjectURL(new Blob([r as Uint8Array<ArrayBuffer>], {
          type: "application/pdf",
        }));
        const name =
          results.length === 1
            ? `${base}_split.pdf`
            : `${base}_part${i + 1}.pdf`;
        return { url, name };
      });
      setOutputs(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Split failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Split PDF"
        description="Split a PDF into page ranges, single pages, or equal chunks."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a PDF file here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <div className={styles.fileBar}>
            <span className={styles.fileName}>
              {file.name}, {(file.size / 1024).toFixed(0)} KB
            </span>
            <button
              type="button"
              className={styles.changeFile}
              onClick={() => {
                setFile(null);
                setOutputs([]);
                setError(null);
              }}
            >
              Choose another file
            </button>
          </div>
          <div className={styles.modeTabs}>
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                data-advanced={
                  ADVANCED_MODES.includes(m.value) ? "true" : undefined
                }
                onClick={() => setMode(m.value)}
                className={`${styles.modeTab} ${
                  activeMode === m.value ? styles.modeTabActive : ""
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className={styles.modeHelp}>{MODE_HELP[activeMode]}</p>

          {activeMode === "by-range" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="range">
                Page ranges (e.g. 1-3,5,8-10)
              </label>
              <input
                id="range"
                type="text"
                value={rangeString}
                onChange={(e) => setRangeString(e.target.value)}
                placeholder="1-3,5,8-10"
                className={styles.input}
                aria-describedby="range-hint"
              />
              <p id="range-hint" className={styles.hint}>
                Each group becomes a separate file: 1-3 makes one, 5 makes one,
                8-10 makes one.
              </p>
            </div>
          )}

          {activeMode === "by-pages" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pages">
                Page numbers (comma-separated, e.g. 1,4,7)
              </label>
              <input
                id="pages"
                type="text"
                value={pageNumbers}
                onChange={(e) => setPageNumbers(e.target.value)}
                placeholder="1,4,7"
                className={styles.input}
                aria-describedby="pages-hint"
              />
              <p id="pages-hint" className={styles.hint}>
                Each listed page becomes a separate file, in the order you type
                them.
              </p>
            </div>
          )}

          {activeMode === "by-n" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="everyN">
                Pages per split
              </label>
              <input
                id="everyN"
                type="number"
                min="1"
                value={everyN}
                onChange={(e) => setEveryN(e.target.value)}
                placeholder="10"
                className={styles.input}
                aria-describedby="everyN-hint"
              />
              <p id="everyN-hint" className={styles.hint}>
                For example, 10 turns a 25-page PDF into files of 10, 10, and 5
                pages.
              </p>
            </div>
          )}

          {activeMode === "by-even-odd" && (
            <p className={styles.note}>
              Two files are produced: 1, 3, 5… and 2, 4, 6…
            </p>
          )}

          {activeMode === "by-bookmarks" && (
            <p className={styles.note}>
              Splits at each top-level bookmark (PDF outline). Files with no
              readable bookmarks are not split.
            </p>
          )}

          {activeMode === "by-size" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="size">
                Max chunk size
              </label>
              <div className={styles.sizeRow}>
                <input
                  id="size"
                  type="number"
                  min="1"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder="1"
                  className={styles.input}
                  aria-describedby="size-hint"
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as "KB" | "MB")}
                  className={styles.input}
                  aria-label="Size unit"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
              <p id="size-hint" className={styles.hint}>
                A target, not a hard cap: pages are kept whole, so a file can
                come out slightly larger.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={split}
            disabled={!canSplit}
            className={styles.splitBtn}
          >
            {processing ? "Splitting…" : "Split PDF"}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {outputs.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.resultsTitle}>
            Split into {outputs.length} file{outputs.length === 1 ? "" : "s"}
          </h2>
          <ul className={styles.resultsList}>
            {outputs.map((out) => (
              <li key={out.name} className={styles.resultRow}>
                <span className={styles.resultName}>{out.name}</span>
                <a href={out.url} download={out.name} className={styles.downloadBtn}>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolLayout>
  );
}