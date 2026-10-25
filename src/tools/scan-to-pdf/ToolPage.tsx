"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { captureFrame, pagesToPdf, type CapturedPage } from "./logic";
import styles from "./ToolPage.module.scss";

export default function ScanToPdfTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("scan.pdf");
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setError("Camera access was denied or is unavailable.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const capture = () => {
    if (!videoRef.current) return;
    try {
      setPages((prev) => [...prev, captureFrame(videoRef.current!)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed.");
    }
  };

  const removePage = (idx: number) =>
    setPages((prev) => prev.filter((_, i) => i !== idx));

  const canConvert = pages.length >= 1 && !processing;

  const convert = async () => {
    if (!canConvert) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await pagesToPdf(pages);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName("scan.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Scan to PDF"
        description="Use the camera to make a PDF of paper."
      />

      <div className={styles.panel}>
        {cameraOn ? (
          <>
            <video ref={videoRef} playsInline muted className={styles.video} />
            <div className={styles.captureActions}>
              <button type="button" onClick={capture} className={styles.captureBtn}>
                Capture page
              </button>
              <button type="button" onClick={stopCamera} className={styles.stopBtn}>
                Stop camera
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={startCamera} className={styles.startBtn}>
            Start camera
          </button>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {pages.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.resultsTitle}>
            {pages.length} page{pages.length === 1 ? "" : "s"} captured
          </h2>
          <ul className={styles.resultsList}>
            {pages.map((_, idx) => (
              <li key={idx} className={styles.resultRow}>
                <span className={styles.resultName}>Page {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removePage(idx)}
                  className={styles.removeBtn}
                  aria-label={`Remove page ${idx + 1}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={convert}
            disabled={!canConvert}
            className={styles.convertBtn}
          >
            {processing ? "Building…" : "Create PDF"}
          </button>
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}