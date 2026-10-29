"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { FLATTEN_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function FlattenPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("flattened.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canFlatten = file !== null && !processing;

  const flatten = async () => {
    if (!canFlatten || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(FLATTEN_PDF_TYPE, {
        buffer,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_flattened.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to flatten PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Flatten PDF"
        description="Bake annotations and form fields into the page."
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
          <p className={styles.note}>
            Flattening removes interactive elements such as annotations, links,
            and form fields. The visible content is preserved as rendered.
          </p>
          <button
            type="button"
            onClick={flatten}
            disabled={!canFlatten}
            className={styles.flattenBtn}
          >
            {processing ? "Flattening…" : "Flatten PDF"}
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