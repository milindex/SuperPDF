"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
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

export default function SplitPdfTool() {
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

  const canSplit = file !== null && !processing;

  const split = async () => {
    if (!canSplit || !file) return;
    setProcessing(true);
    setOutputs([]);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      let action: Mode = mode;
      let payload: Record<string, unknown> = {};

      if (mode === "by-range") {
        if (!rangeString.trim()) throw new Error("Enter page ranges.");
        payload = { rangeString };
      } else if (mode === "by-pages") {
        const pages = pageNumbers
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n));
        if (pages.length === 0) throw new Error("Enter page numbers.");
        payload = { pageNumbers: pages };
      } else if (mode === "by-n") {
        const n = parseInt(everyN, 10);
        if (!n || n < 1) throw new Error("Enter the number of pages per split.");
        payload = { everyNPages: n };
      } else if (mode === "by-size") {
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
        description="Extract pages or ranges into separate files, right in your browser."
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
          <div className={styles.modeTabs}>
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`${styles.modeTab} ${
                  mode === m.value ? styles.modeTabActive : ""
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "by-range" && (
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
              />
            </div>
          )}

          {mode === "by-pages" && (
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
              />
            </div>
          )}

          {mode === "by-n" && (
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
              />
            </div>
          )}

          {mode === "by-even-odd" && (
            <p className={styles.note}>
              Produces two files: odd-numbered pages (1, 3, 5…) and
              even-numbered pages (2, 4, 6…).
            </p>
          )}

          {mode === "by-bookmarks" && (
            <p className={styles.note}>
              Splits at each top-level bookmark (PDF outline). Files with no
              readable bookmarks are not split.
            </p>
          )}

          {mode === "by-size" && (
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
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as "KB" | "MB")}
                  className={styles.input}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
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