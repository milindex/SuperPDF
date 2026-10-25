"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { DragNDropRegion } from "@/components/DragNDropRegion/DragNDropRegion";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import { exportThumbnails, type ThumbnailFormat } from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

export default function ExportThumbnailsTool() {
  const mode = useToolMode();
  const easy = mode?.mode !== "advanced";
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ThumbnailFormat>("png");
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("thumbnails.zip");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  const run = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    try {
      const blob = await exportThumbnails(
        await file.arrayBuffer(),
        easy ? "png" : format,
        easy ? 2 : scale,
        setProgress,
      );
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + "-pages.zip");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The pages could not be exported.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Export Thumbnails"
        description="Save every PDF page as a PNG or JPEG in a ZIP."
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

          <div className={panel.field}>
            <label className={panel.label} htmlFor="thumbnail-format">
              Image format
            </label>
            <select
              id="thumbnail-format"
              className={panel.input}
              value={easy ? "png" : format}
              disabled={easy}
              onChange={(event) =>
                setFormat(event.target.value as ThumbnailFormat)
              }
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
            <p className={panel.hint}>
              {easy
                ? "Easy mode exports PNG at 2× resolution."
                : "PNG is sharper. JPEG makes a smaller ZIP."}
            </p>
          </div>

          <div className={panel.field} data-advanced="true">
            <label className={panel.label} htmlFor="thumbnail-scale">
              Resolution
            </label>
            <select
              id="thumbnail-scale"
              className={panel.input}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
            >
              <option value={1}>1× (screen)</option>
              <option value={2}>2× (print)</option>
              <option value={3}>3× (large)</option>
            </select>
            <p className={panel.hint}>
              Higher values make sharper images and a larger ZIP.
            </p>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={processing}
            className={panel.primary}
          >
            {processing
              ? `Exporting ${progress}%…`
              : "Export pages"}
          </button>
          {error && <p className={panel.error}>{error}</p>}
        </div>
      )}

      {resultUrl && (
        <SuccessBanner
          url={resultUrl}
          fileName={resultName}
          downloadText="Download ZIP"
          successText="Every page was exported."
        />
      )}
    </ToolLayout>
  );
}
