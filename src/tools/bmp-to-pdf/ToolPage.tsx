"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { bmpToPdf } from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

export default function BmpToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("bmp-images.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFiles(accepted);
    setResultUrl(null);
    setError(null);
  }, []);

  const convert = async () => {
    if (files.length === 0 || processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await bmpToPdf(files);
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName("bmp-images.pdf");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to convert the images.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="BMP to PDF"
        description="Put one or more BMP images into a single PDF."
      />

      <DragNDropRegion
        onDrop={handleFiles}
        accept={{ "image/bmp": [".bmp"] }}
        multiple
        text="Drop BMP images here"
        buttonText="Choose BMP images"
      />

      {files.length > 0 && (
        <div className={panel.panel}>
          <span className={panel.fileName}>
            {files.length} image{files.length === 1 ? "" : "s"}, one page each
          </span>
          <p className={panel.note}>
            Each BMP is converted to PNG on this device, then placed on its own
            page in the order shown.
          </p>
          <button
            type="button"
            onClick={convert}
            disabled={processing}
            className={panel.primary}
          >
            {processing ? "Converting…" : "Convert to PDF"}
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
