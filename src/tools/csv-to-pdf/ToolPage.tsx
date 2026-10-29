"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { CSV_TO_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function CsvToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("table.pdf");
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
      const csv = await file.text();
      if (!csv.trim()) throw new Error("The CSV file is empty.");
      const result = (await sendToSw(CSV_TO_PDF_TYPE, { csv })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.\w+$/, "") + ".pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert CSV.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="CSV to PDF"
        description="Lay out a CSV file as a PDF table."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "text/csv": [".csv"], "text/plain": [".csv"] }}
        multiple={false}
        text="Drag & drop a CSV file here"
        buttonText="Choose CSV file"
      />

      {file && (
        <div className={styles.panel}>
          <span className={styles.fileName}>{file.name}</span>
          <p className={styles.note}>
            The first row is treated as a header. Columns beyond the sixth are
            omitted.
          </p>
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