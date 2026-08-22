"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import {
  ADD_PAGE_NUMBERS_TYPE,
  type PageNumberFormat,
  type PageNumberPosition,
} from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

const FORMATS: { value: PageNumberFormat; label: string }[] = [
  { value: "page-x-of-y", label: "Page X of Y" },
  { value: "number-only", label: "Number only (1, 2, 3…)" },
];

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
];

export default function AddPageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<PageNumberFormat>("page-x-of-y");
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startNumber, setStartNumber] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("numbered.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canAdd = file !== null && !processing;

  const addNumbers = async () => {
    if (!canAdd || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const start = parseInt(startNumber, 10);
      if (Number.isNaN(start) || start < 1) {
        throw new Error("Enter a valid starting page number.");
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(ADD_PAGE_NUMBERS_TYPE, {
        buffer,
        format,
        position,
        startNumber: start,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_numbered.pdf");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add page numbers.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Add Page Numbers"
        description="Insert page numbers at custom positions and styles — entirely in your browser."
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
            <label className={styles.label}>Format</label>
            <div className={styles.optionTabs}>
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`${styles.optionTab} ${
                    format === f.value ? styles.optionTabActive : ""
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="position">
              Position
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
              className={styles.input}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="start">
              Starting page number
            </label>
            <input
              id="start"
              type="number"
              min="1"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              className={styles.input}
            />
          </div>

          <button
            type="button"
            onClick={addNumbers}
            disabled={!canAdd}
            className={styles.numberBtn}
          >
            {processing ? "Adding…" : "Add Page Numbers"}
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