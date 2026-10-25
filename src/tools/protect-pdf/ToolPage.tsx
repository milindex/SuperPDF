"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { detectProtectFeasibility, protectPdf, type ProtectFeasibility } from "./logic";
import styles from "./ToolPage.module.scss";

export default function ProtectPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [feasibility, setFeasibility] = useState<ProtectFeasibility | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("protected.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const f = accepted[0];
    setFile(f);
    setFeasibility(null);
    setResultUrl(null);
    setError(null);
    setPassword("");
    setConfirm("");
    setDetecting(true);
    try {
      const buffer = await f.arrayBuffer();
      setFeasibility(await detectProtectFeasibility(buffer));
    } catch {
      setFeasibility({ status: "invalid", error: "Could not read this file." });
    } finally {
      setDetecting(false);
    }
  }, []);

  const protectable = feasibility?.status === "protectable";

  const protect = async () => {
    if (!protectable || !file) return;
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = await protectPdf(buffer, password);
      const blob = new Blob([result as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_protected.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to protect PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const statusMessage = (() => {
    if (detecting) return null;
    if (!feasibility) return null;
    switch (feasibility.status) {
      case "protectable":
        return {
          kind: "ok" as const,
          text: `This PDF (${feasibility.pageCount} page${feasibility.pageCount === 1 ? "" : "s"}) can be password-protected in the browser. The file stays in this tab.`,
        };
      case "already-encrypted":
        return {
          kind: "error" as const,
          text: "This PDF already has a password. Remove it with Unlock PDF before adding a new one.",
        };
      case "invalid":
        return { kind: "error" as const, text: feasibility.error };
    }
  })();

  return (
    <ToolLayout>
      <ToolHeader
        title="Protect PDF"
        description="Add a password that opens the file."
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

          {protectable && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
              <p className={styles.note}>
                The password is applied in this tab and is not stored anywhere.
                Keep a copy: a lost password cannot be recovered.
              </p>
              <button
                type="button"
                onClick={protect}
                disabled={processing}
                className={styles.protectBtn}
              >
                {processing ? "Protecting…" : "Protect PDF"}
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