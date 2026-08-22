"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { FILL_FORMS_TYPE, type FillFormsField } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

interface FieldRow {
  key: string;
  name: string;
  value: string;
}

export default function FillFormsTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<FieldRow[]>([]);
  const [flatten, setFlatten] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("filled.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", value: "" },
    ]);

  const updateRow = (key: string, patch: Partial<Pick<FieldRow, "name" | "value">>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const canFill = file !== null && rows.some((r) => r.name.trim()) && !processing;

  const fill = async () => {
    if (!canFill || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const fields: FillFormsField[] = rows
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name.trim(), value: r.value }));

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(FILL_FORMS_TYPE, {
        buffer,
        fields,
        flatten,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_filled.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fill the form.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Fill Out PDF"
        description="Fill in PDF form fields and save the result — entirely in your browser."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drag & drop a PDF form here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>{file.name}</span>

          <div className={styles.fieldHeader}>
            <span className={styles.fieldTitle}>Form fields</span>
            <button type="button" onClick={addRow} className={styles.addBtn}>
              + Add field
            </button>
          </div>

          {rows.length > 0 && (
            <div className={styles.rows}>
              {rows.map((row) => (
                <div key={row.key} className={styles.row}>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.key, { name: e.target.value })}
                    placeholder="Field name"
                    className={`${styles.input} ${styles.nameInput}`}
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.key, { value: e.target.value })}
                    placeholder="Value"
                    className={`${styles.input} ${styles.valueInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className={styles.removeBtn}
                    aria-label="Remove field"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={flatten}
              onChange={(e) => setFlatten(e.target.checked)}
              className={styles.checkbox}
            />
            Flatten fields (make them uneditable)
          </label>

          <button
            type="button"
            onClick={fill}
            disabled={!canFill}
            className={styles.fillBtn}
          >
            {processing ? "Filling…" : "Fill & Download"}
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