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
    default:
      throw new Error(`Unknown tool type: ${type}`);
  }
}

/** Set of handled types — kept in sync with the switch above for the lint check. */
export const handledTypes: string[] = ["merge-pdf"];
