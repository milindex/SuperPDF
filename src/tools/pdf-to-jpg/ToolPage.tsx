"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { pdfToJpg, type RenderedImage } from "./logic";
import styles from "./ToolPage.module.scss";

interface OutputFile {
  url: string;
  name: string;
}

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setOutputs([]);
    setError(null);
  }, []);

  const canConvert = file !== null && !processing;

  const convert = async () => {
    if (!canConvert || !file) return;
    setProcessing(true);
    setOutputs([]);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const images: RenderedImage[] = await pdfToJpg(buffer);
      const items = images.map((img) => ({
        url: URL.createObjectURL(
          new Blob([img.bytes as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }),
        ),
        name: img.name,
      }));
      setOutputs(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="PDF to JPG"
        description="Save each PDF page as a JPG image."
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
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Converting…" : "Convert to JPG"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {outputs.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.resultsTitle}>
            {outputs.length} page{outputs.length === 1 ? "" : "s"} converted
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