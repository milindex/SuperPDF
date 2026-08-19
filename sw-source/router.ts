/**
 * Service Worker router. Every SW-routed tool must have a case here.
 * The set of handled `type`s is cross-checked against `sendToSw()` calls in
 * the UI by a CI lint script (see Agent.md §0.2 / §5).
 */
export async function routeRequest(
  type: string,
  payload: unknown,
): Promise<unknown> {
  const core = await import("./processors/core");

  switch (type) {
    // TODO: add tool cases here as they are implemented (Phase 2).
    default:
      throw new Error(`Unknown tool type: ${type}`);
  }
}

/** Set of handled types — kept in sync with the switch above for the lint check. */
export const handledTypes: string[] = [];
