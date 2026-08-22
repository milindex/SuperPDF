"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { pdfToHtml } from "./logic";
import styles from "./ToolPage.module.scss";

export default function PdfToHtmlTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("converted.html");
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
      const bytes = await pdfToHtml(buffer);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "text/html",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_html.html");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="PDF to HTML"
        description="Convert PDF pages into a standalone HTML page — entirely in your browser."
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
            Each page is embedded as an image in the HTML. Text is not selectable.
          </p>
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Converting…" : "Convert to HTML"}
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