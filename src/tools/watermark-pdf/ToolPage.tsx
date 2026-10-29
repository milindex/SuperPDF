"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import { sendToSw } from "@/lib/sw-client";
import { WATERMARK_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function WatermarkPdfTool() {
  const mode = useToolMode();
  const easy = mode?.mode !== "advanced";
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState("0.2");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("watermarked.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canWatermark = file !== null && !processing;

  const watermark = async () => {
    if (!canWatermark || !file) return;
    if (!text.trim()) {
      setError("Enter watermark text.");
      return;
    }
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const parsedOpacity = easy ? 0.2 : parseFloat(opacity);
      if (Number.isNaN(parsedOpacity) || parsedOpacity < 0 || parsedOpacity > 1) {
        throw new Error("Opacity must be between 0 and 1.");
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(WATERMARK_PDF_TYPE, {
        buffer,
        text: text.trim(),
        opacity: parsedOpacity,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_watermarked.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to watermark PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Watermark PDF"
        description="Stamp a word or notice across every page."
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
          <span className={styles.fileName}>{file.name}</span>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="text">
              Watermark text
            </label>
            <input
              id="text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CONFIDENTIAL"
              className={styles.input}
            />
          </div>
          <div className={styles.field} data-advanced="true">
            <label className={styles.label} htmlFor="opacity">
              Opacity
            </label>
            <input
              id="opacity"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(e.target.value)}
              className={styles.input}
            />
            <p className={styles.hint}>
              0 is invisible and 1 is solid. Around 0.2 reads as a light stamp.
            </p>
          </div>
          {easy && (
            <p className={styles.note}>
              Easy mode uses 20% opacity. Switch to Advanced to change it.
            </p>
          )}
          <p className={styles.note}>
            The watermark is drawn across the centre of every page. It sits on
            top of the content, so choose a value that keeps the page readable.
          </p>
          <button
            type="button"
            onClick={watermark}
            disabled={!canWatermark}
            className={styles.watermarkBtn}
          >
            {processing ? "Watermarking…" : "Add Watermark"}
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