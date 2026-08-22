"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { pngToPdf } from "./logic";
import styles from "./ToolPage.module.scss";

export default function PngToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("images.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFiles(accepted);
    setResultUrl(null);
    setError(null);
  }, []);

  const canConvert = files.length >= 1 && !processing;

  const convert = async () => {
    if (!canConvert) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await pngToPdf(files);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName("png-images.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="PNG to PDF"
        description="Convert PNG images into a PDF — entirely in your browser."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "image/png": [".png"] }}
        multiple={true}
        text="Drag & drop PNG images here"
        buttonText="Choose PNG images"
      />

      {files.length > 0 && (
        <div className={styles.panel}>
          <span className={styles.fileName}>
            {files.length} image{files.length === 1 ? "" : "s"} ready
          </span>
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Converting…" : "Convert to PDF"}
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