"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { DELETE_PAGES_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("deleted.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canDelete = file !== null && !processing;

  const deleteNow = async () => {
    if (!canDelete || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const pages = pagesInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10) - 1) // 1-based input → 0-based
        .filter((n) => !Number.isNaN(n));
      if (pages.length === 0) throw new Error("Enter page numbers to delete.");

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(DELETE_PAGES_TYPE, {
        buffer,
        pageIndices: pages,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_deleted.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Delete Pages"
        description="Remove the pages you do not need and keep the rest."
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
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pages">
              Pages to delete (comma-separated, e.g. 1,3,5)
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
              Pages are removed from the copy you download. The original file on
              your device is not changed.
            </p>
          </div>
          <button
            type="button"
            onClick={deleteNow}
            disabled={!canDelete}
            className={styles.deleteBtn}
          >
            {processing ? "Deleting…" : "Delete Pages"}
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