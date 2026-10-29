"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { EXTRACT_PAGES_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function ExtractPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("extracted.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canExtract = file !== null && !processing;

  const extract = async () => {
    if (!canExtract || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const pageIndices = pagesInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10) - 1) // 1-based input → 0-based
        .filter((n) => !Number.isNaN(n));
      if (pageIndices.length === 0) {
        throw new Error("Enter page numbers to extract.");
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(EXTRACT_PAGES_TYPE, {
        buffer,
        pageIndices,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_extracted.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Extract Pages"
        description="Pull selected pages into a new PDF."
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
            <label className={styles.label} htmlFor="pages">
              Pages to extract (comma-separated, e.g. 1,3,5)
            </label>
            <input
              id="pages"
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="1,3,5"
              className={styles.input}
            />
            <p className={styles.hint}>
              Pages you leave out are not included in the new file. Their order
              is kept as listed.
            </p>
          </div>
          <button
            type="button"
            onClick={extract}
            disabled={!canExtract}
            className={styles.extractBtn}
          >
            {processing ? "Extracting…" : "Extract Pages"}
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