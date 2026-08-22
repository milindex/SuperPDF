"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { REPAIR_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function RepairPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("repaired.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canRepair = file !== null && !processing;

  const repair = async () => {
    if (!canRepair || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(REPAIR_PDF_TYPE, {
        buffer,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_repaired.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to repair PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Repair PDF"
        description="Repair corrupted or damaged PDF files — entirely in your browser."
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
            Repairing rebuilds the PDF structure, dropping dangling references.
            Severely damaged or password-protected files may not be repairable.
          </p>
          <button
            type="button"
            onClick={repair}
            disabled={!canRepair}
            className={styles.repairBtn}
          >
            {processing ? "Repairing…" : "Repair PDF"}
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