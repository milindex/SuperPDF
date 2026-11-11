"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Lazily loads each tool's Client Component so only the selected tool's
 * chunk(s) are shipped with a given tool page. Kept inside a Client
 * Component because Next.js does not support automatic code splitting when
 * a Server Component dynamically imports a Client Component.
 */
const toolComponents: Record<string, ComponentType<{ toolId: string }>> = {
  "merge-pdf": dynamic(() => import("@/tools/merge-pdf/ToolPage")),
  "split-pdf": dynamic(() => import("@/tools/split-pdf/ToolPage")),
  "rotate-pdf": dynamic(() => import("@/tools/rotate-pdf/ToolPage")),
  "delete-pages": dynamic(() => import("@/tools/delete-pages/ToolPage")),
  "reorder-pages": dynamic(() => import("@/tools/reorder-pages/ToolPage")),
  "extract-pages": dynamic(() => import("@/tools/extract-pages/ToolPage")),
  "organize-pages": dynamic(() => import("@/tools/organize-pages/ToolPage")),
  "add-page-numbers": dynamic(() => import("@/tools/add-page-numbers/ToolPage")),
  "flatten-pdf": dynamic(() => import("@/tools/flatten-pdf/ToolPage")),
  "sign-pdf": dynamic(() => import("@/tools/sign-pdf/ToolPage")),
  "crop-pdf": dynamic(() => import("@/tools/crop-pdf/ToolPage")),
  "redact-pdf": dynamic(() => import("@/tools/redact-pdf/ToolPage")),
  "watermark-pdf": dynamic(() => import("@/tools/watermark-pdf/ToolPage")),
  "page-size": dynamic(() => import("@/tools/page-size/ToolPage")),
  "protect-pdf": dynamic(() => import("@/tools/protect-pdf/ToolPage")),
  "unlock-pdf": dynamic(() => import("@/tools/unlock-pdf/ToolPage")),
  "remove-metadata": dynamic(() => import("@/tools/remove-metadata/ToolPage")),
  "edit-metadata": dynamic(() => import("@/tools/edit-metadata/ToolPage")),
  "text-to-pdf": dynamic(() => import("@/tools/text-to-pdf/ToolPage")),
  "csv-to-pdf": dynamic(() => import("@/tools/csv-to-pdf/ToolPage")),
  "repair-pdf": dynamic(() => import("@/tools/repair-pdf/ToolPage")),
  "fill-forms": dynamic(() => import("@/tools/fill-forms/ToolPage")),
  "pdf-to-text": dynamic(() => import("@/tools/pdf-to-text/ToolPage")),
  "pdf-to-markdown": dynamic(() => import("@/tools/pdf-to-markdown/ToolPage")),
  "pdf-to-jpg": dynamic(() => import("@/tools/pdf-to-jpg/ToolPage")),
  "pdf-to-png": dynamic(() => import("@/tools/pdf-to-png/ToolPage")),
  "extract-images": dynamic(() => import("@/tools/extract-images/ToolPage")),
  "pdf-to-word": dynamic(() => import("@/tools/pdf-to-word/ToolPage")),
  "pdf-to-powerpoint": dynamic(() => import("@/tools/pdf-to-powerpoint/ToolPage")),
  "pdf-to-excel": dynamic(() => import("@/tools/pdf-to-excel/ToolPage")),
  "pdf-to-svg": dynamic(() => import("@/tools/pdf-to-svg/ToolPage")),
  "pdf-to-html": dynamic(() => import("@/tools/pdf-to-html/ToolPage")),
  "jpg-to-pdf": dynamic(() => import("@/tools/jpg-to-pdf/ToolPage")),
  "png-to-pdf": dynamic(() => import("@/tools/png-to-pdf/ToolPage")),
  "webp-to-pdf": dynamic(() => import("@/tools/webp-to-pdf/ToolPage")),
  "svg-to-pdf": dynamic(() => import("@/tools/svg-to-pdf/ToolPage")),
  "heic-to-pdf": dynamic(() => import("@/tools/heic-to-pdf/ToolPage")),
  "tiff-to-pdf": dynamic(() => import("@/tools/tiff-to-pdf/ToolPage")),
  "excel-to-pdf": dynamic(() => import("@/tools/excel-to-pdf/ToolPage")),
  "word-to-pdf": dynamic(() => import("@/tools/word-to-pdf/ToolPage")),
  "webpage-to-pdf": dynamic(() => import("@/tools/webpage-to-pdf/ToolPage")),
  "compress-pdf": dynamic(() => import("@/tools/compress-pdf/ToolPage")),
  "ocr-pdf": dynamic(() => import("@/tools/ocr-pdf/ToolPage")),
  "pdf-to-pdfa": dynamic(() => import("@/tools/pdf-to-pdfa/ToolPage")),
  "scan-to-pdf": dynamic(() => import("@/tools/scan-to-pdf/ToolPage")),
  "bmp-to-pdf": dynamic(() => import("@/tools/bmp-to-pdf/ToolPage")),
  "html-to-pdf": dynamic(() => import("@/tools/html-to-pdf/ToolPage")),
  "inspect-metadata": dynamic(() => import("@/tools/inspect-metadata/ToolPage")),
  "export-thumbnails": dynamic(() => import("@/tools/export-thumbnails/ToolPage")),
  "remove-restrictions": dynamic(() => import("@/tools/remove-restrictions/ToolPage")),
  "create-pdf": dynamic(() => import("@/tools/create-pdf/ToolPage")),
};

export function ToolRuntime({
  toolId,
  toolName,
  status,
}: {
  toolId: string;
  toolName: string;
  status: string;
}) {
  const Tool = toolComponents[toolId];

  if (!Tool) {
    return (
      <div>
        <h1>{toolName}</h1>
        <p>This tool is not implemented yet (status: {status}).</p>
      </div>
    );
  }

  return <Tool toolId={toolId} />;
}

export default ToolRuntime;
