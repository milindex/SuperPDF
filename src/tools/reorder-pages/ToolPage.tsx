"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { REORDER_PAGES_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function ReorderPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [orderInput, setOrderInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("reordered.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canReorder = file !== null && !processing;

  const reorderNow = async () => {
    if (!canReorder || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const newOrder = orderInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10) - 1) // 1-based input → 0-based
        .filter((n) => !Number.isNaN(n));
      if (newOrder.length === 0) throw new Error("Enter a page order.");

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(REORDER_PAGES_TYPE, {
        buffer,
        newOrder,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_reordered.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Reorder Pages"
        description="Put pages in a new order without rebuilding the document."
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
          <label className={styles.orderLabel} htmlFor="order">
            New page order (comma-separated, 1-based)
          </label>
          <span className={styles.orderHint}>
            e.g. 3,1,2 puts page 3 first, then 1, then 2. Any page not listed is
            omitted.
          </span>
          <input
            id="order"
            type="text"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            placeholder="3,1,2"
            className={styles.input}
          />
          <button
            type="button"
            onClick={reorderNow}
            disabled={!canReorder}
            className={styles.reorderBtn}
          >
            {processing ? "Reordering…" : "Reorder Pages"}
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
