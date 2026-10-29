"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFilePreview } from "./FilePreviewContext";
import styles from "./FilePreview.module.scss";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot > 0 ? file.name.slice(dot + 1).toUpperCase() : "FILE";
}

type PreviewKind = "pdf" | "image" | "other";
type Status = "idle" | "loading" | "ready" | "error";

function kindOf(file: File): PreviewKind {
  const ext = extension(file);
  if (file.type === "application/pdf" || ext === "PDF") return "pdf";
  if (file.type.startsWith("image/") || ["JPG", "JPEG", "PNG", "WEBP", "SVG", "HEIC", "TIFF", "BMP", "GIF"].includes(ext)) {
    return "image";
  }
  return "other";
}

/**
 * Sticky preview rail for the selected tool input. Drop zones collapse once a
 * file is chosen; this shows the first page (PDF), the image, or a type badge,
 * plus size, page count and a replace/add shortcut.
 */
export default function FilePreviewRail() {
  const preview = useFilePreview();
  const [thumb, setThumb] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const objectUrlRef = useRef<string | null>(null);

  const file = preview?.file ?? null;
  const kind = file ? kindOf(file) : "other";

  useEffect(() => {
    setThumb(null);
    setPages(null);
    if (!file) {
      setStatus("idle");
      return;
    }

    let disposed = false;
    let pdfDoc: { destroy: () => Promise<void> } | null = null;
    let objectUrl: string | null = null;
    setStatus("loading");

    const run = async () => {
      if (kind === "image") {
        objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;
        if (!disposed) {
          setThumb(objectUrl);
          setStatus("ready");
        }
        return;
      }

      if (kind !== "pdf") {
        setStatus("ready");
        return;
      }

      const { loadPdf, renderPageToDataUrl } = await import("@/lib/pdfjs");
      const doc = await loadPdf(await file.arrayBuffer());
      pdfDoc = doc;
      if (disposed) {
        await doc.destroy();
        return;
      }
      const page = await renderPageToDataUrl(doc, 1, 0.9, "image/jpeg", 0.72);
      if (!disposed) {
        setThumb(page.dataUrl);
        setPages(doc.pageCount);
        setStatus("ready");
      }
    };

    run().catch(() => {
      if (!disposed) setStatus("error");
    });

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (objectUrlRef.current === objectUrl) objectUrlRef.current = null;
      if (pdfDoc) void pdfDoc.destroy();
    };
  }, [file, kind]);

  if (!preview || !file) return null;

  const isMultiple = preview.count > 1;

  return (
    <aside className={styles.rail} aria-label="Selected file preview">
      <div className={styles.sticky}>
        <div className={styles.head}>
          <p className="hud-label">Selected file</p>
          <p className={`hud-label ${styles.kind}`}>
            {isMultiple ? `${preview.count} files` : extension(file)}
          </p>
        </div>

        <div className={styles.thumbWrap}>
          {status === "loading" && kind !== "other" && (
            <span className={styles.skeleton} aria-hidden="true" />
          )}

          {status === "ready" && thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={`${file.name} preview`}
              className={styles.thumb}
            />
          )}

          {(status === "error" || kind === "other" || (!thumb && status !== "loading")) && (
            <span className={styles.fallback} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
              <b>{extension(file)}</b>
            </span>
          )}

          {kind === "pdf" && status === "ready" && (
            <span className={styles.pageTag}>Page 1</span>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.name} title={file.name}>
            {file.name}
          </p>
          <p className={styles.dim}>
            {formatBytes(file.size)}
            {pages ? ` · ${pages} page${pages === 1 ? "" : "s"}` : ""}
            {isMultiple ? ` · showing first of ${preview.count}` : ""}
          </p>

          <dl className={styles.meta}>
            <div>
              <dt>Type</dt>
              <dd>{extension(file)}</dd>
            </div>
            {pages !== null && (
              <div>
                <dt>Pages</dt>
                <dd>{pages}</dd>
              </div>
            )}
            <div>
              <dt>Server copy</dt>
              <dd className={styles.safe}>None</dd>
            </div>
          </dl>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.replace}
            onClick={preview.openPicker}
          >
            {preview.multiple ? "Add file" : "Replace file"}
          </button>
          <p className={styles.note}>Read on this device · never uploaded</p>
        </div>
      </div>
    </aside>
  );
}
