"use client";

import { useCallback, useRef, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { sendToSw } from "@/lib/sw-client";
import { SIGN_PDF_TYPE } from "@/lib/sw-contract";
import styles from "./ToolPage.module.scss";

export default function SignPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("signed.pdf");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    draw(e);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    draw(e);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.beginPath();
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hasSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return true;
    }
    return false;
  }, []);

  const canSign = file !== null && !processing;

  const sign = async () => {
    if (!canSign || !file) return;
    if (!hasSignature()) {
      setError("Draw your signature on the pad first.");
      return;
    }
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const canvas = canvasRef.current!;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Could not capture the signature.");
      const signatureImage = new Uint8Array(await blob.arrayBuffer());

      const buffer = await file.arrayBuffer();
      const result = (await sendToSw(SIGN_PDF_TYPE, {
        buffer,
        signatureImage,
      })) as Uint8Array;
      const outBlob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(outBlob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_signed.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Sign PDF"
        description="Draw a signature and place it on the page."
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
          <label className={styles.label}>Draw your signature</label>
          <p className={styles.signHint}>
            Use a mouse, finger, or stylus. The signature is placed at the
            bottom-right of the first page.
          </p>
          <canvas
            ref={canvasRef}
            width={560}
            height={180}
            className={styles.signPad}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <div className={styles.signActions}>
            <button
              type="button"
              onClick={clearSignature}
              className={styles.clearBtn}
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={sign}
            disabled={!canSign}
            className={styles.signBtn}
          >
            {processing ? "Signing…" : "Sign PDF"}
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