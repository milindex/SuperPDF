"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { htmlFileToPdf } from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

export default function HtmlToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("document.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const convert = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await htmlFileToPdf(file);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.html?$/i, "") + ".pdf");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to convert the HTML file.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="HTML to PDF"
        description="Turn a local HTML file into a PDF."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        file={file}
        accept={{ "text/html": [".html", ".htm"] }}
        multiple={false}
        text="Drop an HTML file here"
        buttonText="Choose HTML file"
        hint="The file is read in this tab. Pages and images linked over the network may not load."
      />

      {file && (
        <div className={panel.panel}>
          <span className={panel.fileName}>{file.name}</span>
          <p className={panel.note}>
            The page is rendered at A4 width. Styles saved inside the file are
            kept; assets that need a network request may be missing.
          </p>
          <button
            type="button"
            onClick={convert}
            disabled={processing}
            className={panel.primary}
          >
            {processing ? "Rendering…" : "Convert to PDF"}
          </button>
          {error && <p className={panel.error}>{error}</p>}
        </div>
      )}

      {resultUrl && (
        <SuccessBanner url={resultUrl} fileName={resultName} />
      )}
    </ToolLayout>
  );
}
