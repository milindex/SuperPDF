"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { removeRestrictions } from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

export default function RemoveRestrictionsTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("unrestricted.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
  }, []);

  const run = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await removeRestrictions(await file.arrayBuffer());
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "_unrestricted.pdf");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The restrictions could not be removed.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Remove Restrictions"
        description="Remove owner restrictions such as printing or copying limits."
        notice="If the PDF asks for a password to open, use Unlock PDF instead."
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
          <p className={panel.note}>
            This removes owner restrictions from the copy you download. It does
            not guess a password. The file stays in this tab.
          </p>
          <button
            type="button"
            onClick={run}
            disabled={processing}
            className={panel.primary}
          >
            {processing ? "Removing…" : "Remove restrictions"}
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
