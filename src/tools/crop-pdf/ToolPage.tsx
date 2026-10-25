"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { CROP_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function CropPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: "5", right: "5", bottom: "5", left: "5" });
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("cropped.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const canCrop = file !== null && !processing;

  const crop = async () => {
    if (!canCrop || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const parsed = {
        top: parseFloat(margins.top),
        right: parseFloat(margins.right),
        bottom: parseFloat(margins.bottom),
        left: parseFloat(margins.left),
      };
      for (const [k, v] of Object.entries(parsed)) {
        if (Number.isNaN(v) || v < 0 || v > 90) {
          throw new Error(`${k} margin must be between 0 and 90%.`);
        }
      }

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(CROP_PDF_TYPE, {
        buffer,
        topPct: parsed.top,
        rightPct: parsed.right,
        bottomPct: parsed.bottom,
        leftPct: parsed.left,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_cropped.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const setMargin = (key: keyof typeof margins) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMargins((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Crop PDF"
        description="Trim the margins from every page."
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
          <div className={styles.grid}>
            {(["top", "right", "bottom", "left"] as const).map((key) => (
              <div key={key} className={styles.field}>
                <label className={styles.label} htmlFor={key}>
                  {key[0].toUpperCase() + key.slice(1)} margin (%)
                </label>
                <input
                  id={key}
                  type="number"
                  min="0"
                  max="90"
                  value={margins[key]}
                  onChange={setMargin(key)}
                  className={styles.input}
                />
              </div>
            ))}
          </div>
          <p className={styles.hint}>
            Margins are a percentage of each page. A small trim removes a scan
            border; 0% leaves the page unchanged.
          </p>
          <button
            type="button"
            onClick={crop}
            disabled={!canCrop}
            className={styles.cropBtn}
          >
            {processing ? "Cropping…" : "Crop PDF"}
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