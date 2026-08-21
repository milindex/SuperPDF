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
      };
      switch (p.action) {
        case "by-pages":
          return logic.splitPdfByPages(p.buffer, p.pageNumbers ?? []);
        case "by-size":
          return logic.splitPdfBySize(p.buffer, p.maxSizeBytes ?? 0);
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
    default:
      throw new Error(`Unknown tool type: ${type}`);
  }
}

/** Set of handled types — kept in sync with the switch above for the lint check. */
export const handledTypes: string[] = ["merge-pdf", "split-pdf", "rotate-pdf"];
