"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { inspectPdfMetadata, type PdfMetadata } from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function InspectMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    const next = accepted[0];
    setFile(next);
    setMetadata(null);
    setError(null);
    setBusy(true);
    try {
      setMetadata(await inspectPdfMetadata(await next.arrayBuffer()));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "This file could not be read as a PDF.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <ToolLayout>
      <ToolHeader
        title="Inspect Metadata"
        description="Read the hidden properties stored in a PDF."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "application/pdf": [] }}
        multiple={false}
        text="Drop a PDF here"
        buttonText="Choose PDF file"
      />

      {file && (
        <div className={panel.panel}>
          <span className={panel.fileName}>{file.name}</span>
          {busy && <p className={panel.meta}>Reading the document properties…</p>}

          {metadata && (
            <>
              <h2 className={panel.resultsTitle}>Document properties</h2>
              <dl className={panel.metaList}>
                <dt>Title</dt>
                <dd>{metadata.title}</dd>
                <dt>Author</dt>
                <dd>{metadata.author}</dd>
                <dt>Subject</dt>
                <dd>{metadata.subject}</dd>
                <dt>Keywords</dt>
                <dd>{metadata.keywords}</dd>
                <dt>Creator</dt>
                <dd>{metadata.creator}</dd>
                <dt>Producer</dt>
                <dd>{metadata.producer}</dd>
                <dt>Pages</dt>
                <dd>{metadata.pageCount}</dd>
                <dt>Created</dt>
                <dd>{formatDate(metadata.creationDate)}</dd>
                <dt>Modified</dt>
                <dd>{formatDate(metadata.modificationDate)}</dd>
                <dt>Encrypted</dt>
                <dd>{metadata.isEncrypted ? "Yes" : "No"}</dd>
              </dl>

              <h2 className={panel.resultsTitle}>Page sizes</h2>
              <dl className={panel.metaList}>
                {metadata.pageSizes.map((page) => (
                  <div key={page.index} className={panel.resultRow}>
                    <dt>Page {page.index}</dt>
                    <dd>
                      {page.width} × {page.height} pt
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {error && <p className={panel.error}>{error}</p>}
        </div>
      )}
    </ToolLayout>
  );
}
