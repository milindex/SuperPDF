"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { detectUnlockFeasibility, unlockPdf, type UnlockFeasibility } from "./logic";
import styles from "./ToolPage.module.scss";

export default function UnlockPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [feasibility, setFeasibility] = useState<UnlockFeasibility | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("unlocked.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    setFeasibility(null);
    setResultUrl(null);
    setError(null);
    setPassword("");
    setDetecting(true);
    try {
      const buffer = await f.arrayBuffer();
      setFeasibility(await detectUnlockFeasibility(buffer));
    } catch {
      setFeasibility({ status: "invalid", error: "Could not read this file." });
    } finally {
      setDetecting(false);
    }
  }, []);

  const encrypted = feasibility?.status === "encrypted";

  const unlock = async () => {
    if (!encrypted || !file) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = await unlockPdf(buffer, password || undefined);
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_unlocked.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const statusMessage = (() => {
    if (detecting) return null;
    if (!feasibility) return null;
    switch (feasibility.status) {
      case "not-encrypted":
        return {
          kind: "ok" as const,
          text: `This PDF (${feasibility.pageCount} page${feasibility.pageCount === 1 ? "" : "s"}) is not password-protected. Nothing to unlock.`,
        };
      case "encrypted":
        return {
          kind: "ok" as const,
          text: "This PDF is password-protected. It can be unlocked entirely in your browser with the correct password. No server upload needed.",
        };
      case "invalid":
        return { kind: "error" as const, text: feasibility.error };
    }
  })();

  return (
    <ToolLayout>
      <ToolHeader
        title="Unlock PDF"
        description="Remove password protection from your PDF files — entirely in your browser."
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
          {detecting && <p className={styles.note}>Checking this PDF in your browser…</p>}
          {statusMessage && (
            <p className={statusMessage.kind === "ok" ? styles.ok : styles.error}>
              {statusMessage.text}
            </p>
          )}

          {encrypted && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password (if the PDF requires one)
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional"
                  className={styles.input}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={unlock}
                disabled={processing}
                className={styles.unlockBtn}
              >
                {processing ? "Unlocking…" : "Unlock PDF"}
              </button>
              {error && <p className={styles.error}>{error}</p>}
            </>
          )}
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}