"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { ROTATE_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

const ANGLES = [90, 180, 270];

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<number>(90);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("rotated.pdf");

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
  }, []);

  const rotate = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(ROTATE_PDF_TYPE, {
        buffer,
        angle,
      })) as Uint8Array;
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_rotated.pdf");
    } catch (err) {
      console.error("Rotate failed:", err);
      alert("Failed to rotate PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Rotate PDF"
        description="Rotate all pages of your PDF by 90, 180, or 270 degrees — entirely in your browser."
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
            <label className={styles.label}>Rotation angle</label>
            <div className={styles.angleRow}>
              {ANGLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={`${styles.angleBtn} ${
                    angle === a ? styles.angleBtnActive : ""
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={rotate}
            disabled={processing}
            className={styles.rotateBtn}
          >
            {processing ? "Rotating…" : "Rotate PDF"}
          </button>
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}