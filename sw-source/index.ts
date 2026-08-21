/// <reference lib="webworker" />

import { routeRequest } from "./router";

const ctx = self as unknown as ServiceWorkerGlobalScope;

ctx.addEventListener("install", (event) => {
  event.waitUntil(ctx.skipWaiting());
});

ctx.addEventListener("activate", (event) => {
  event.waitUntil(ctx.clients.claim());
});

ctx.addEventListener("message", async (event: ExtendableMessageEvent) => {
  const { type, id, payload } = (event.data || {}) as {
    type?: string;
    id?: number;
    payload?: unknown;
  };
  if (!type || typeof id !== "number") return;

  // The client sends its reply port via MessageChannel (see sw-client.ts).
  const port = event.ports?.[0];
  if (!port) return;

  const respond = (msg: unknown, transfer?: Transferable[]) => {
    port.postMessage(msg, transfer ? { transfer } : undefined);
  };

  try {
    const result = await routeRequest(type, payload);
    const transfer = result instanceof Uint8Array ? [result.buffer] : undefined;
    respond({ id, result }, transfer as Transferable[] | undefined);
  } catch (error) {
    respond({
      id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
