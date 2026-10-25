"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout/ToolLayout";
import { ToolHeader } from "@/components/ToolHeader/ToolHeader";
import { SuccessBanner } from "@/components/SuccessBanner/SuccessBanner";
import { useToolMode } from "@/components/ToolModeScope/ToolModeScope";
import {
  PAGE_PRESETS,
  createBlankPdf,
  type Orientation,
  type PagePreset,
} from "./logic";
import panel from "@/components/ToolPanel/ToolPanel.module.scss";

export default function CreatePdfTool() {
  const mode = useToolMode();
  const easy = mode?.mode !== "advanced";
  const [preset, setPreset] = useState<PagePreset>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [pageCount, setPageCount] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (processing) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      const bytes = await createBlankPdf(
        easy ? "a4" : preset,
        easy ? "portrait" : orientation,
        easy ? 1 : pageCount,
      );
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The PDF could not be created.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout>
      <ToolHeader
        title="Create PDF"
        description="Start with a blank PDF at the size and page count you need."
      />

      <div className={panel.panel}>
        <div className={panel.field}>
          <label className={panel.label} htmlFor="create-size">
            Page size
          </label>
          <select
            id="create-size"
            className={panel.input}
            value={easy ? "a4" : preset}
            disabled={easy}
            onChange={(event) => setPreset(event.target.value as PagePreset)}
          >
            {Object.entries(PAGE_PRESETS).map(([value, size]) => (
              <option key={value} value={value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className={panel.field} data-advanced="true">
          <label className={panel.label} htmlFor="create-orientation">
            Orientation
          </label>
          <select
            id="create-orientation"
            className={panel.input}
            value={orientation}
            onChange={(event) =>
              setOrientation(event.target.value as Orientation)
            }
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div className={panel.field} data-advanced="true">
          <label className={panel.label} htmlFor="create-pages">
            Pages
          </label>
          <input
            id="create-pages"
            className={panel.input}
            type="number"
            min={1}
            max={200}
            value={pageCount}
            onChange={(event) => setPageCount(Number(event.target.value))}
          />
          <p className={panel.hint}>Between 1 and 200 pages.</p>
        </div>

        {easy && (
          <p className={panel.hint}>
            Easy mode creates one A4 portrait page. Switch to Advanced for size,
            orientation, and page count.
          </p>
        )}

        <button
          type="button"
          onClick={create}
          disabled={processing}
          className={panel.primary}
        >
          {processing ? "Creating…" : "Create PDF"}
        </button>
        {error && <p className={panel.error}>{error}</p>}
      </div>

      {resultUrl && <SuccessBanner url={resultUrl} fileName="blank.pdf" />}
    </ToolLayout>
  );
}
