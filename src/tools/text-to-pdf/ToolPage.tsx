"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { TEXT_TO_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function TextToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("text.pdf");
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
      const text = await file.text();
      if (!text.trim()) throw new Error("The text file is empty.");
      const result = (await sendToSw(TEXT_TO_PDF_TYPE, { text })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.\w+$/, "") + ".pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert text.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Text to PDF"
        description="Turn plain text into a clean PDF."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "text/plain": [".txt", ".md", ".log"] }}
        multiple={false}
        text="Drag & drop a text file here"
        buttonText="Choose text file"
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