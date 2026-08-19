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

  const respond = async (msg: unknown, transfer?: Transferable[]) => {
    const source = event.source as Client | null;
    const client = source?.id ? await ctx.clients.get(source.id) : null;
    client?.postMessage(msg, transfer ? { transfer } : undefined);
  };

  try {
    const result = await routeRequest(type, payload);
    const transfer = result instanceof Uint8Array ? [result.buffer] : undefined;
    await respond({ id, result }, transfer as Transferable[] | undefined);
  } catch (error) {
    await respond({
      id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
