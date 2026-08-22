"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { pdfToText } from "./logic";
import styles from "./ToolPage.module.scss";

export default function PdfToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("extracted.txt");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canConvert = file !== null && !processing;

  const convert = async () => {
    if (!canConvert || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const text = await pdfToText(buffer);
      if (!text.trim()) throw new Error("No text found in this PDF.");
      const blob = new Blob([text], { type: "text/plain" });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_text.txt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="PDF to Text"
        description="Extract text content from a PDF — entirely in your browser."
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
          <p className={styles.note}>
            Scanned documents without a text layer return no text — use PDF OCR
            for those.
          </p>
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Extracting…" : "Extract Text"}
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