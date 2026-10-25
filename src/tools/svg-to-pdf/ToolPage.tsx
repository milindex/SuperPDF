"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { svgToPdf } from "./logic";
import styles from "./ToolPage.module.scss";

export default function SvgToPdfTool() {
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
      const bytes = await svgToPdf(files);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName("svg-images.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="SVG to PDF"
        description="Put one or more SVG graphics into a single PDF."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "image/svg+xml": [".svg"] }}
        multiple={true}
        text="Drag & drop SVG images here"
        buttonText="Choose SVG images"
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