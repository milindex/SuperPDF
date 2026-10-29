"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import { compressPdf } from "./logic";
import styles from "./ToolPage.module.scss";

export default function CompressPdfTool() {
  const mode = useToolMode();
  const easy = mode?.mode !== "advanced";
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("0.7");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("compressed.pdf");
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setResultSize(null);
    setError(null);
  }, []);

  const canCompress = file !== null && !processing;

  const compress = async () => {
    if (!canCompress || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setResultSize(null);
    setError(null);
    try {
      const q = easy ? 0.7 : parseFloat(quality);
      if (Number.isNaN(q) || q < 0.1 || q > 1) {
        throw new Error("Quality must be between 0.1 and 1.");
      }
      const buffer = await file.arrayBuffer();
      const bytes = await compressPdf(buffer, q);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setResultName(file.name.replace(/\.pdf$/i, "") + "_compressed.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Compress PDF"
        description="Shrink a large PDF, with a quality setting you control."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a PDF file here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>
            {file.name}, {(file.size / 1024).toFixed(0)} KB
          </span>
          <div className={styles.field} data-advanced="true">
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="quality">
                Image quality
              </label>
              <span className={styles.value}>{Math.round(parseFloat(quality) * 100)}%</span>
            </div>
            <input
              id="quality"
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className={styles.range}
              aria-describedby="quality-hint"
            />
            <div className={styles.scale} aria-hidden="true">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
            <p id="quality-hint" className={styles.hint}>
              Lower values shrink the file more but soften images. Pages are
              rasterised, so text becomes non-selectable at every setting.
            </p>
          </div>
          {easy && (
            <p className={styles.note}>
              Easy mode uses 70% quality. Switch to Advanced to change it.
            </p>
          )}
          <p className={styles.note}>
            Text-only PDFs may not shrink much, because the text has to be
            redrawn as an image.
          </p>
          <button
            type="button"
            onClick={compress}
            disabled={!canCompress}
            className={styles.compressBtn}
          >
            {processing ? "Compressing…" : "Compress PDF"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {resultUrl && resultSize !== null && (
        <SuccessBanner
          url={resultUrl}
          fileName={resultName}
          successText={
            file && resultSize < file.size
              ? `Your document is ready. It is ${Math.round(
                  (1 - resultSize / file.size) * 100,
                )}% smaller than the original.`
              : "Your document is ready to download."
          }
        />
      )}
    </ToolLayout>
  );
}