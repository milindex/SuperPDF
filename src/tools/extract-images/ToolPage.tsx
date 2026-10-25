"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { extractImages, type ExtractedImage } from "./logic";
import styles from "./ToolPage.module.scss";

interface OutputFile {
  url: string;
  name: string;
}

export default function ExtractImagesTool() {
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

  const canExtract = file !== null && !processing;

  const extract = async () => {
    if (!canExtract || !file) return;
    setProcessing(true);
    setOutputs([]);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const images: ExtractedImage[] = await extractImages(buffer);
      if (images.length === 0) throw new Error("No images found in this PDF.");
      const items = images.map((img, idx) => ({
        url: URL.createObjectURL(
          new Blob([img.bytes as Uint8Array<ArrayBuffer>], { type: img.mimeType }),
        ),
        name: `${file.name.replace(/\.pdf$/i, "")}_${img.name || `image-${idx + 1}.png`}`,
      }));
      setOutputs(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Extract Images"
        description="Pull the images out of a PDF."
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
            Extracts images placed on pages via PDF drawing operators. Embedded
            fonts, patterns, and masked images are not exported.
          </p>
          <button
            type="button"
            onClick={extract}
            disabled={!canExtract}
            className={styles.extractBtn}
          >
            {processing ? "Extracting…" : "Extract Images"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {outputs.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.resultsTitle}>
            {outputs.length} image{outputs.length === 1 ? "" : "s"} extracted
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