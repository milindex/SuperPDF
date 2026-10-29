"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { ocrPdf } from "./logic";
import styles from "./ToolPage.module.scss";

export default function OcrPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("ocr.txt");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
    setProgress("");
  }, []);

  const canOcr = file !== null && !processing;

  const run = async () => {
    if (!canOcr || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    setProgress("Loading OCR engine…");
    try {
      const buffer = await file.arrayBuffer();
      const text = await ocrPdf(buffer, (page, total) =>
        setProgress(`Recognizing page ${page} of ${total}…`),
      );
      if (!text.trim()) throw new Error("No text was recognized in this PDF.");
      const blob = new Blob([text], { type: "text/plain" });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_ocr.txt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed.");
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="PDF OCR"
        description="Make a scanned PDF searchable by recognising its text."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a scanned PDF here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>{file.name}</span>
          <p className={styles.note}>
            The OCR engine (~50 MB) downloads to your browser on first use.
            Accuracy depends on scan quality; English is supported.
          </p>
          {progress && <p className={styles.progress}>{progress}</p>}
          <button
            type="button"
            onClick={run}
            disabled={!canOcr}
            className={styles.ocrBtn}
          >
            {processing ? "Recognizing…" : "Extract Text with OCR"}
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