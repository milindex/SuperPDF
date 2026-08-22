"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { webpageToPdf } from "./logic";
import styles from "./ToolPage.module.scss";

export default function WebpageToPdfTool() {
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("webpage.pdf");
  const [error, setError] = useState<string | null>(null);

  const normalizeUrl = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  }, []);

  const canConvert = url.trim().length > 0 && !processing;

  const convert = async () => {
    if (!canConvert) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const target = normalizeUrl(url);
      const bytes = await webpageToPdf(target);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName("webpage.pdf");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load the page. Many sites block in-browser access.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Webpage to PDF"
        description="Convert a webpage URL to a PDF — entirely in your browser."
      />

      <div className={styles.panel}>
        <label className={styles.label} htmlFor="url">
          Webpage URL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className={styles.input}
        />
        <p className={styles.note}>
          Works only for pages that allow in-browser access (CORS). Most
          third-party sites block this without a server.
        </p>
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

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}