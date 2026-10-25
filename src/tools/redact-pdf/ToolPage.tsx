"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { REDACT_PDF_TYPE, type RedactRegion } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

interface DraftRegion {
  key: string;
  pageIndex: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

export default function RedactPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageInput, setPageInput] = useState("1");
  const [rect, setRect] = useState({ x: "10", y: "10", w: "30", h: "20" });
  const [regions, setRegions] = useState<DraftRegion[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("redacted.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const addRegion = () => {
    const pageIndex = parseInt(pageInput, 10) - 1;
    const xPct = parseFloat(rect.x);
    const yPct = parseFloat(rect.y);
    const widthPct = parseFloat(rect.w);
    const heightPct = parseFloat(rect.h);
    if (
      Number.isNaN(pageIndex) ||
      pageIndex < 0 ||
      [xPct, yPct, widthPct, heightPct].some((v) => Number.isNaN(v)) ||
      widthPct <= 0 ||
      heightPct <= 0
    ) {
      setError("Enter valid page number and rectangle values.");
      return;
    }
    setError(null);
    setRegions((prev) => [
      ...prev,
      { key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, pageIndex, xPct, yPct, widthPct, heightPct },
    ]);
  };

  const removeRegion = (key: string) =>
    setRegions((prev) => prev.filter((r) => r.key !== key));

  const canRedact = file !== null && regions.length > 0 && !processing;

  const redact = async () => {
    if (!canRedact || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const payload: RedactRegion[] = regions.map(({ key: _k, ...r }) => r);
      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(REDACT_PDF_TYPE, {
        buffer,
        regions: payload,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_redacted.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redact PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const clearAll = () => {
    setRegions([]);
    setResultUrl(null);
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Redact PDF"
        description="Cover sensitive areas before you share the file."
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
          <span className={styles.fileName}>{file.name}</span>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="page">
              Page number
            </label>
            <input
              id="page"
              type="number"
              min="1"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.rectGrid}>
            {(["x", "y", "w", "h"] as const).map((k) => (
              <div key={k} className={styles.field}>
                <label className={styles.label} htmlFor={k}>
                  {k === "x" ? "X (%)" : k === "y" ? "Y (%)" : k === "w" ? "Width (%)" : "Height (%)"}
                </label>
                <input
                  id={k}
                  type="number"
                  min="0"
                  value={rect[k]}
                  onChange={(e) =>
                    setRect((prev) => ({ ...prev, [k]: e.target.value }))
                  }
                  className={styles.input}
                />
              </div>
            ))}
          </div>
          <p className={styles.hint}>
            Coordinates are a percentage of the page, measured from the top-left.
            Add one region for each area to hide.
          </p>

          <button
            type="button"
            onClick={addRegion}
            className={styles.addBtn}
          >
            + Add region
          </button>

          {regions.length > 0 && (
            <div className={styles.regionBox}>
              <div className={styles.regionHeader}>
                <span className={styles.regionTitle}>
                  Regions ({regions.length})
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className={styles.clearBtn}
                >
                  Clear all
                </button>
              </div>
              <ul className={styles.regionList}>
                {regions.map((r) => (
                  <li key={r.key} className={styles.regionRow}>
                    <span className={styles.regionLabel}>
                      Page {r.pageIndex + 1}, {r.xPct}% / {r.yPct}%, {r.widthPct}×{r.heightPct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRegion(r.key)}
                      className={styles.removeBtn}
                      aria-label="Remove region"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className={styles.note}>
            Redaction is destructive: covered content is permanently hidden.
            Coordinates are measured from the top-left of each page.
          </p>

          <button
            type="button"
            onClick={redact}
            disabled={!canRedact}
            className={styles.redactBtn}
          >
            {processing ? "Redacting…" : "Redact PDF"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}