"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { PAGE_SIZE_TYPE, type PageSizePreset } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

const PRESETS: { value: PageSizePreset; label: string }[] = [
  { value: "a4", label: "A4 (210 × 297 mm)" },
  { value: "letter", label: "Letter (8.5 × 11 in)" },
  { value: "a5", label: "A5 (148 × 210 mm)" },
  { value: "legal", label: "Legal (8.5 × 14 in)" },
];

const PRESET_PTS: Record<PageSizePreset, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  a5: { width: 419.53, height: 595.28 },
  legal: { width: 612, height: 1008 },
};

export default function PageSizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<PageSizePreset>("a4");
  const [custom, setCustom] = useState(false);
  const [customW, setCustomW] = useState("595");
  const [customH, setCustomH] = useState("842");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("resized.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canResize = file !== null && !processing;

  const resize = async () => {
    if (!canResize || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      let width: number;
      let height: number;
      if (custom) {
        width = parseFloat(customW);
        height = parseFloat(customH);
        if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
          throw new Error("Enter valid width and height in points.");
        }
      } else {
        const s = PRESET_PTS[preset];
        width = s.width;
        height = s.height;
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(PAGE_SIZE_TYPE, {
        buffer,
        width,
        height,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_resized.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resize PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Change Page Size"
        description="Resize PDF pages to standard or custom dimensions — entirely in your browser."
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

          <div className={styles.optionTabs}>
            <button
              type="button"
              onClick={() => setCustom(false)}
              className={`${styles.optionTab} ${!custom ? styles.optionTabActive : ""}`}
            >
              Preset
            </button>
            <button
              type="button"
              onClick={() => setCustom(true)}
              className={`${styles.optionTab} ${custom ? styles.optionTabActive : ""}`}
            >
              Custom
            </button>
          </div>

          {custom ? (
            <div className={styles.customGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cw">
                  Width (points)
                </label>
                <input
                  id="cw"
                  type="number"
                  min="1"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ch">
                  Height (points)
                </label>
                <input
                  id="ch"
                  type="number"
                  min="1"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          ) : (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="preset">
                Page size
              </label>
              <select
                id="preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value as PageSizePreset)}
                className={styles.input}
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={resize}
            disabled={!canResize}
            className={styles.resizeBtn}
          >
            {processing ? "Resizing…" : "Resize Pages"}
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