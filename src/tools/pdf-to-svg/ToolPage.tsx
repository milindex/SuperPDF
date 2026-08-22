"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { pdfToSvg } from "./logic";
import styles from "./ToolPage.module.scss";

interface OutputFile {
  url: string;
  name: string;
}

export default function PdfToSvgTool() {
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
      const svgs = await pdfToSvg(buffer);
      const items = svgs.map((svg, idx) => ({
        url: URL.createObjectURL(
          new Blob([svg as Uint8Array<ArrayBuffer>], { type: "image/svg+xml" }),
        ),
        name: `page-${idx + 1}.svg`,
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
        title="PDF to SVG"
        description="Convert PDF pages into SVG vector graphics — entirely in your browser."
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
            Each page is exported as an SVG container with the rendered content
            embedded as an image — not fully vectorized text.
          </p>
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Converting…" : "Convert to SVG"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {outputs.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.resultsTitle}>
            {outputs.length} SVG{outputs.length === 1 ? "" : "s"} created
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