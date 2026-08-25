/**
 * Service Worker router. Every SW-routed tool must have a case here.
 * The set of handled `type`s is cross-checked against `sendToSw()` calls in
 * the UI by a CI lint script (see Agent.md §0.2 / §5).
 */
export async function routeRequest(
  type: string,
  payload: unknown,
): Promise<unknown> {
  switch (type) {
    case "merge-pdf": {
      const { mergePdfs } = await import("@/tools/merge-pdf/logic");
      const p = payload as { buffers: ArrayBuffer[] };
      return mergePdfs(p.buffers);
    }
    case "split-pdf": {
      const logic = await import("@/tools/split-pdf/logic");
      const p = payload as {
        action: string;
        buffer: ArrayBuffer;
        rangeString?: string;
        pageNumbers?: number[];
        maxSizeBytes?: number;
        everyNPages?: number;
      };
      switch (p.action) {
        case "by-pages":
          return logic.splitPdfByPages(p.buffer, p.pageNumbers ?? []);
        case "by-size":
          return logic.splitPdfBySize(p.buffer, p.maxSizeBytes ?? 0);
        case "by-even-odd":
          return logic.splitPdfByEvenOdd(p.buffer);
        case "by-n":
          return logic.splitPdfEveryN(p.buffer, p.everyNPages ?? 1);
        case "by-bookmarks":
          return logic.splitPdfByBookmarks(p.buffer);
        case "by-range":
        default:
          return logic.splitPdfByRange(p.buffer, p.rangeString ?? "");
      }
    }
    case "rotate-pdf": {
      const logic = await import("@/tools/rotate-pdf/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        angle?: number;
        pageRotations?: Record<number, number>;
      };
      if (p.pageRotations) {
        return logic.rotatePdf(p.buffer, p.pageRotations);
      }
      return logic.rotateAllPages(p.buffer, p.angle ?? 90);
    }
    case "delete-pages": {
      const { deletePages } = await import("@/tools/delete-pages/logic");
      const p = payload as { buffer: ArrayBuffer; pageIndices: number[] };
      return deletePages(p.buffer, p.pageIndices);
    }
    case "reorder-pages": {
      const { reorderPages } = await import("@/tools/reorder-pages/logic");
      const p = payload as { buffer: ArrayBuffer; newOrder: number[] };
      return reorderPages(p.buffer, p.newOrder);
    }
    case "extract-pages": {
      const { extractPages } = await import("@/tools/extract-pages/logic");
      const p = payload as { buffer: ArrayBuffer; pageIndices: number[] };
      return extractPages(p.buffer, p.pageIndices);
    }
    case "organize-pages": {
      const { organizePages } = await import("@/tools/organize-pages/logic");
      const p = payload as { buffers: ArrayBuffer[]; newOrder: number[] };
      return organizePages(p.buffers, p.newOrder);
    }
    case "add-page-numbers": {
      const { addPageNumbers } = await import("@/tools/add-page-numbers/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        format: "page-x-of-y" | "number-only";
        position:
          | "bottom-left"
          | "bottom-center"
          | "bottom-right"
          | "top-left"
          | "top-center"
          | "top-right";
        startNumber?: number;
      };
      return addPageNumbers(p.buffer, p.format, p.position, p.startNumber);
    }
    case "flatten-pdf": {
      const { flattenPdf } = await import("@/tools/flatten-pdf/logic");
      const p = payload as { buffer: ArrayBuffer };
      return flattenPdf(p.buffer);
    }
    case "sign-pdf": {
      const { signPdf } = await import("@/tools/sign-pdf/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        signatureImage: Uint8Array;
        pageIndex?: number;
        width?: number;
      };
      return signPdf(p.buffer, p.signatureImage, p.pageIndex, p.width);
    }
    case "crop-pdf": {
      const { cropPdf } = await import("@/tools/crop-pdf/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        topPct: number;
        rightPct: number;
        bottomPct: number;
        leftPct: number;
      };
      return cropPdf(p.buffer, p.topPct, p.rightPct, p.bottomPct, p.leftPct);
    }
    case "redact-pdf": {
      const { redactPdf } = await import("@/tools/redact-pdf/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        regions: { pageIndex: number; xPct: number; yPct: number; widthPct: number; heightPct: number }[];
      };
      return redactPdf(p.buffer, p.regions);
    }
    case "watermark-pdf": {
      const { watermarkPdf } = await import("@/tools/watermark-pdf/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        text: string;
        fontSize?: number;
        opacity?: number;
      };
      return watermarkPdf(p.buffer, p.text, p.fontSize, p.opacity);
    }
    case "page-size": {
      const { resizePdf, PRESET_SIZES } = await import("@/tools/page-size/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        width?: number;
        height?: number;
        preset?: "a4" | "letter" | "a5" | "legal";
      };
      const size = p.preset ? PRESET_SIZES[p.preset] : { width: p.width, height: p.height };
      if (!size.width || !size.height) {
        throw new Error("Provide a size preset or width/height.");
      }
      return resizePdf(p.buffer, size.width, size.height);
    }
    case "remove-metadata": {
      const { removeMetadata } = await import("@/tools/remove-metadata/logic");
      const p = payload as { buffer: ArrayBuffer };
      return removeMetadata(p.buffer);
    }
    case "edit-metadata": {
      const { editMetadata } = await import("@/tools/edit-metadata/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
      };
      const { buffer, ...fields } = p;
      return editMetadata(buffer, fields);
    }
    case "text-to-pdf": {
      const { textToPdf } = await import("@/tools/text-to-pdf/logic");
      const p = payload as { text: string };
      return textToPdf(p.text);
    }
    case "csv-to-pdf": {
      const { csvToPdf } = await import("@/tools/csv-to-pdf/logic");
      const p = payload as { csv: string };
      return csvToPdf(p.csv);
    }
    case "repair-pdf": {
      const { repairPdf } = await import("@/tools/repair-pdf/logic");
      const p = payload as { buffer: ArrayBuffer };
      return repairPdf(p.buffer);
    }
    case "fill-forms": {
      const { fillForms } = await import("@/tools/fill-forms/logic");
      const p = payload as {
        buffer: ArrayBuffer;
        fields: { name: string; value: string }[];
        flatten?: boolean;
      };
      return fillForms(p.buffer, p.fields, p.flatten);
    }
    default:
      throw new Error(`Unknown tool type: ${type}`);
  }
}

/** Set of handled types — kept in sync with the switch above for the lint check. */
export const handledTypes: string[] = [
  "merge-pdf",
  "split-pdf",
  "rotate-pdf",
  "delete-pages",
  "reorder-pages",
  "extract-pages",
  "organize-pages",
  "add-page-numbers",
  "flatten-pdf",
  "sign-pdf",
  "crop-pdf",
  "redact-pdf",
  "watermark-pdf",
  "page-size",
  "remove-metadata",
  "edit-metadata",
  "text-to-pdf",
  "csv-to-pdf",
  "repair-pdf",
  "fill-forms",
];
